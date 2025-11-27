from flask import Flask, request, jsonify, send_from_directory, abort
from flask_cors import CORS
from werkzeug.utils import secure_filename
import csv
import io
import os
import uuid
import subprocess
import logging

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESULTS_DIR = os.path.join(BASE_DIR, 'static', 'results')
DATA_PATH = os.path.join(BASE_DIR, 'data.csv')
WRAPPER = os.path.join(BASE_DIR, 'run_analysis_wrapper.py')
LOG_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    filename=os.path.join(LOG_DIR, 'actions.log'),
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

app = Flask(__name__)
CORS(app, supports_credentials=True, allow_headers=['Content-Type', 'Authorization'])

# In-memory stores (demo only)
USERS = {
    'faculty@gmail.com': {'password': 'test123', 'role': 'university'},
    'student@example.com': {'password': 'test123', 'role': 'student'}
}       # email -> {password, role}
TOKENS = {}      # token -> email
RECORDS = {}     # id -> record dict

# Demo tokens that always work (for testing)
DEMO_TOKENS = {
    'demo-faculty-token': 'faculty@gmail.com',
    'demo-student-token': 'student@example.com'
}


def require_token(req):
    auth = req.headers.get('Authorization', '')
    token = auth.strip()
    if not token:
        return None
    # Handle both "Bearer TOKEN" and plain "TOKEN" formats
    if token.lower().startswith('bearer '):
        token = token[7:].strip()
    if not token:
        return None
    # Check in actual tokens first, then demo tokens
    email = TOKENS.get(token) or DEMO_TOKENS.get(token)
    return email


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json(force=True)
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    role = data.get('role') or 'student'
    name = (data.get('name') or '').strip()
    if not email or not password:
        return jsonify({'ok': False, 'error': 'email and password required'}), 400
    if email in USERS:
        return jsonify({'ok': False, 'error': 'user already exists'}), 400
    # Store optional display name (students should provide their full name)
    USERS[email] = {'password': password, 'role': role}
    if name:
        USERS[email]['name'] = name
    logging.info('USER_SIGNUP email=%s role=%s', email, role)
    return jsonify({'ok': True})


@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json(force=True)
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    if not email or not password:
        return jsonify({'ok': False, 'error': 'email and password required'}), 400
    user = USERS.get(email)
    if not user or user.get('password') != password:
        return jsonify({'ok': False, 'error': 'invalid credentials'}), 401
    token = str(uuid.uuid4())
    TOKENS[token] = email
    logging.info('USER_SIGNIN email=%s', email)
    # Return stored name (if any) so frontend can display it
    return jsonify({'ok': True, 'token': token, 'email': email, 'role': user.get('role', 'student'), 'name': user.get('name', '')})


@app.route('/api/upload', methods=['POST', 'OPTIONS'])
def upload():
    if request.method == 'OPTIONS':
        return '', 200
    
    auth_header = request.headers.get('Authorization', 'MISSING')
    logging.info('UPLOAD attempt - auth header: %s', auth_header[:50] if auth_header != 'MISSING' else 'MISSING')
    
    user = require_token(request)
    logging.info('UPLOAD - token validation result: user=%s', user)
    
    if not user:
        logging.warning('UPLOAD - 401 Unauthorized: token missing or invalid')
        return jsonify({'ok': False, 'error': 'missing or invalid token'}), 401
    
    user_obj = USERS.get(user, {})
    if user_obj.get('role') != 'university':
        logging.warning('UPLOAD - 403 Forbidden: user role is %s, not university', user_obj.get('role'))
        return jsonify({'ok': False, 'error': 'only university users can upload datasets'}), 403

    if 'file' not in request.files:
        return jsonify({'ok': False, 'error': 'file field missing'}), 400
    f = request.files['file']
    filename = secure_filename(f.filename)
    if not filename.lower().endswith('.csv'):
        return jsonify({'ok': False, 'error': 'only .csv files allowed'}), 400

    # Wrap the main upload/analysis flow in a broad exception handler so
    # unexpected errors are logged with full tracebacks and returned to the
    # caller in a structured JSON response during development/debugging.
    try:
        try:
            f.save(DATA_PATH)
        except Exception as e:
            logging.exception('Failed to save uploaded file')
            return jsonify({'ok': False, 'error': 'failed to save file', 'details': str(e)}), 500

        # clear results dir
        for fname in os.listdir(RESULTS_DIR):
            try:
                os.unlink(os.path.join(RESULTS_DIR, fname))
            except Exception:
                pass

        # run wrapper
        try:
            proc = subprocess.run(['python3', WRAPPER], cwd=BASE_DIR, capture_output=True, text=True, timeout=120)
            stdout = proc.stdout
            stderr = proc.stderr
        except subprocess.TimeoutExpired:
            logging.exception('Analysis timed out')
            return jsonify({'ok': False, 'error': 'analysis timed out'}), 500
        except Exception as e:
            logging.exception('Failed to run analysis wrapper')
            return jsonify({'ok': False, 'error': str(e)}), 500

        results = sorted(os.listdir(RESULTS_DIR))
    except Exception as e:
        # Capture full traceback for easier debugging. In production you might
        # want to avoid returning full tracebacks to clients.
        import traceback
        tb = traceback.format_exc()
        logging.error('Unhandled exception during upload: %s', tb)
        return jsonify({'ok': False, 'error': 'internal error', 'details': str(e), 'traceback': tb}), 500
    
    # Extract at-risk student details (if columns exist in CSV)
    # Initialize tracking variables used by the extraction logic. A previous
    # typo left these uninitialized in some code paths which caused a
    # NameError and returned HTTP 500 during uploads when extraction ran.
    has_student_details = False
    student_details = []
    all_student_details = []
    ATTENDANCE_THRESHOLD = 75.0  # percent threshold below which we flag Semester Back
    try:
        import pandas as pd
        df = pd.read_csv(DATA_PATH, sep=';')

        # Check if we have the required columns for student details
        # Support both old and new column name formats
        required_cols = ['Name', 'Target']

        # Try different column name variations
        father_name_col = None
        attendance_col = None
        reason_col = None
        father_mobile_col = None
        semester_col = None
        year_col = None

        for col in df.columns:
            col_lower = col.lower()
            if 'father' in col_lower and 'name' in col_lower:
                father_name_col = col
            elif 'attendance' in col_lower:
                attendance_col = col
            elif 'reason' in col_lower:
                reason_col = col
            elif 'father' in col_lower and ('mobile' in col_lower or 'phone' in col_lower or 'contact' in col_lower):
                father_mobile_col = col
            elif col_lower == 'semester':
                semester_col = col
            elif 'year' in col_lower or 'batch' in col_lower or ('admission' in col_lower and 'year' in col_lower):
                year_col = col

        has_name_target = all(col in df.columns for col in required_cols)
        has_details = bool(father_name_col and attendance_col and reason_col)

        def parse_attendance(val):
            try:
                if val is None:
                    return None
                if isinstance(val, (int, float)):
                    return float(val)
                s = str(val).strip()
                # remove percentage sign and non-numeric chars except dot
                s = s.replace('%', '')
                # keep digits and dot and minus
                s = ''.join(ch for ch in s if (ch.isdigit() or ch == '.'))
                if not s:
                    return None
                return float(s)
            except Exception:
                return None

        at_risk_rows = []
        if has_name_target:
            # iterate rows and include those explicitly marked or flagged by low attendance
            for idx, row in df.iterrows():
                orig_target = str(row.get('Target', '')).strip()
                attendance_val = parse_attendance(row.get(attendance_col)) if attendance_col else None
                flagged_by_attendance = (attendance_val is not None and attendance_val < ATTENDANCE_THRESHOLD)
                if orig_target in ('Dropout', 'Semester Back') or flagged_by_attendance:
                    # decide final target
                    final_target = orig_target
                    if orig_target not in ('Dropout',) and flagged_by_attendance:
                        final_target = 'Semester Back'
                    at_risk_rows.append((row, final_target))

            # Build student_details entries from selected rows
            if at_risk_rows:
                has_student_details = True
                for row, final_target in at_risk_rows:
                    student_details.append({
                        'name': str(row.get('Name', '')).strip(),
                        'father_name': str(row.get(father_name_col, '')).strip() if father_name_col else '',
                        'father_mobile': str(row.get(father_mobile_col, '')).strip() if father_mobile_col else '',
                        'attendance_percentage': row.get(attendance_col, '') if attendance_col else '',
                        'reason_for_sem_back': str(row.get(reason_col, '')).strip() if reason_col else '',
                        'target': final_target,
                        'semester': str(row.get(semester_col, '')).strip() if semester_col else '',
                        'year': str(row.get(year_col, '')).strip() if year_col else ''
                    })

        # Build an 'all students' list (useful for frontends that want a full preview)
        if has_name_target:
            try:
                for idx, row in df.iterrows():
                    all_student_details.append({
                        'name': str(row.get('Name', '')).strip(),
                        'father_name': str(row.get(father_name_col, '')).strip() if father_name_col else '',
                        'father_mobile': str(row.get(father_mobile_col, '')).strip() if father_mobile_col else '',
                        'attendance_percentage': row.get(attendance_col, '') if attendance_col else '',
                        'reason_for_sem_back': str(row.get(reason_col, '')).strip() if reason_col else '',
                        'target': str(row.get('Target', '')).strip(),
                        'semester': str(row.get(semester_col, '')).strip() if semester_col else '',
                        'year': str(row.get(year_col, '')).strip() if year_col else ''
                    })
            except Exception:
                # best-effort; do not fail the entire upload if preview building fails
                pass

        # Compute insights
        insights = {'attendance_threshold': ATTENDANCE_THRESHOLD}
        if has_name_target:
            # By year counts
            if year_col:
                try:
                    by_year = {}
                    for r in student_details:
                        y = r.get('year') or 'Unknown'
                        by_year[y] = by_year.get(y, 0) + 1
                    insights['by_year'] = by_year
                except Exception:
                    insights['by_year'] = {}
            else:
                insights['by_year'] = {}

            # Dropout reason counts (use reason_col if available)
            if reason_col:
                try:
                    reason_counts = {}
                    for r in student_details:
                        reason = r.get('reason_for_sem_back') or 'Unknown'
                        reason_counts[reason] = reason_counts.get(reason, 0) + 1
                    insights['reasons'] = reason_counts
                except Exception:
                    insights['reasons'] = {}
            else:
                insights['reasons'] = {}

    except Exception as e:
        logging.warning('Failed to extract student details: %s', str(e))
    
    # Auto-save extracted student details to records database
    auto_saved_count = 0
    if has_student_details and student_details:
        for student in student_details:
            # Check if record already exists
            existing = [r for r in RECORDS.values() if r['name'].lower() == student['name'].lower()]
            if not existing:
                # Create new record
                rec_id = str(uuid.uuid4())
                rec = {
                    'id': rec_id,
                    'name': student['name'],
                    'current_semester': student.get('semester', ''),
                    'father_name': student.get('father_name', ''),
                    'father_mobile': student.get('father_mobile', ''),
                    'reason': student.get('reason_for_sem_back', ''),
                    'attendance_percentage': student.get('attendance_percentage', ''),
                    'created_by': user,
                    'status': student.get('target', ''),  # Dropout or Semester Back
                    'auto_uploaded': True
                }
                RECORDS[rec_id] = rec
                auto_saved_count += 1
                logging.info('AUTO_SAVE_RECORD id=%s by=%s name=%s status=%s mobile=%s', 
                           rec_id, user, rec['name'], rec.get('status', ''), rec.get('father_mobile', ''))
    
    logging.info('UPLOAD by=%s produced=%d files with has_student_details=%s count=%d auto_saved=%d', 
                 user, len(results), has_student_details, len(student_details), auto_saved_count)
    return jsonify({
        'ok': True, 
        'stdout': stdout, 
        'stderr': stderr, 
        'results': results,
        'has_student_details': has_student_details,
        'student_details': student_details,
        'all_student_details': all_student_details,
        'auto_saved_records': auto_saved_count
    })


@app.route('/api/results', methods=['GET'])
def list_results():
    user = require_token(request)
    if not user:
        return jsonify({'ok': False, 'error': 'missing or invalid token'}), 401
    user_obj = USERS.get(user, {})
    # Only university users can view results
    if user_obj.get('role') != 'university':
        return jsonify({'ok': False, 'error': 'only university users can view results'}), 403
    files = sorted(os.listdir(RESULTS_DIR))
    return jsonify({'ok': True, 'results': files})


@app.route('/api/results/manifest', methods=['GET'])
def get_results_manifest():
    """Return the manifest.json contents from RESULTS_DIR as JSON (if present).
    This is useful for frontends/Power BI to read figure descriptions.
    """
    manifest_path = os.path.join(RESULTS_DIR, 'manifest.json')
    if not os.path.exists(manifest_path):
        return jsonify({'ok': False, 'error': 'manifest not found'}), 404
    try:
        import json
        with open(manifest_path, 'r', encoding='utf-8') as mf:
            data = json.load(mf)
        return jsonify({'ok': True, 'manifest': data})
    except Exception as e:
        logging.exception('Failed to read manifest.json')
        return jsonify({'ok': False, 'error': str(e)}), 500


@app.route('/api/insights', methods=['GET'])
def api_insights():
    """Return aggregated insights (by_year, reasons, totals) computed from in-memory RECORDS.
    Accessible to university/faculty users. Students may request only their own insights via name param.
    """
    user = require_token(request)
    if not user:
        return jsonify({'ok': False, 'error': 'missing or invalid token'}), 401
    user_obj = USERS.get(user, {})
    name = request.args.get('name')
    # students may only request their own insights
    if name and user_obj.get('role') == 'student':
        registered_name = USERS.get(user, {}).get('name', '')
        if not registered_name or registered_name.strip().lower() != name.strip().lower():
            return jsonify({'ok': False, 'error': 'insufficient permissions to view this data'}), 403

    # build counts from RECORDS
    by_year = {}
    reasons = {}
    total = 0
    attendance_values = []
    for r in RECORDS.values():
        if name and r.get('name', '').strip().lower() != name.strip().lower():
            continue
        total += 1
        yr = r.get('current_semester') or r.get('year') or 'Unknown'
        by_year[yr] = by_year.get(yr, 0) + 1
        reason = r.get('reason', '') or 'Unknown'
        reasons[reason] = reasons.get(reason, 0) + 1
        try:
            ap = r.get('attendance_percentage')
            if isinstance(ap, str):
                ap = ap.replace('%', '').strip()
            if ap is not None and ap != '':
                attendance_values.append(float(ap))
        except Exception:
            pass

    insights = {
        'ok': True,
        'total_records': total,
        'by_year': by_year,
        'reasons': reasons,
        'attendance_summary': {
            'count': len(attendance_values),
            'mean': float(sum(attendance_values) / len(attendance_values)) if attendance_values else None,
            'min': float(min(attendance_values)) if attendance_values else None,
            'max': float(max(attendance_values)) if attendance_values else None,
        }
    }
    return jsonify(insights)


@app.route('/api/records.csv', methods=['GET'])
def api_records_csv():
    """Return all records as a CSV stream. Only university users allowed, or students for their own record via ?name=.
    This endpoint is handy for Power BI CSV import.
    """
    user = require_token(request)
    if not user:
        return jsonify({'ok': False, 'error': 'missing or invalid token'}), 401
    user_obj = USERS.get(user, {})
    name = request.args.get('name')
    # students may only request their own CSV
    if name and user_obj.get('role') == 'student':
        registered_name = USERS.get(user, {}).get('name', '')
        if not registered_name or registered_name.strip().lower() != name.strip().lower():
            return jsonify({'ok': False, 'error': 'insufficient permissions to view this data'}), 403

    if user_obj.get('role') not in ('university', 'admin', 'faculty') and user_obj.get('role') != 'student':
        return jsonify({'ok': False, 'error': 'insufficient permissions'}), 403

    # prepare CSV in-memory
    fieldnames = ['id', 'name', 'current_semester', 'father_name', 'father_mobile', 'reason', 'attendance_percentage', 'created_by', 'status', 'auto_uploaded']
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for r in RECORDS.values():
        if name and r.get('name', '').strip().lower() != name.strip().lower():
            continue
        row = {k: r.get(k, '') for k in fieldnames}
        writer.writerow(row)
    csv_data = output.getvalue()
    output.close()
    return (csv_data, 200, {'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="records.csv"'})


@app.route('/results/<path:filename>', methods=['GET'])
def get_result_file(filename):
    safe = secure_filename(filename)
    if not os.path.exists(os.path.join(RESULTS_DIR, safe)):
        abort(404)
    return send_from_directory(RESULTS_DIR, safe)


# Records endpoints
@app.route('/api/records', methods=['GET', 'POST'])
def records_collection():
    user = require_token(request)
    if not user:
        return jsonify({'ok': False, 'error': 'missing or invalid token'}), 401
    user_obj = USERS.get(user, {})

    if request.method == 'GET':
        name = request.args.get('name')
        # If a student user is requesting by name, ensure they can only request their own name
        if name and user_obj.get('role') == 'student':
            registered_name = USERS.get(user, {}).get('name', '')
            if not registered_name or registered_name.strip().lower() != name.strip().lower():
                return jsonify({'ok': False, 'error': 'insufficient permissions to view this record'}), 403
        if name:
            matched = [r for r in RECORDS.values() if r['name'].lower() == name.lower()]
            return jsonify({'ok': True, 'records': matched})
        if user_obj.get('role') not in ('university', 'admin'):
            return jsonify({'ok': False, 'error': 'insufficient permissions'}), 403
        return jsonify({'ok': True, 'records': list(RECORDS.values())})

    # POST - create
    if user_obj.get('role') != 'university':
        return jsonify({'ok': False, 'error': 'only university users can create records'}), 403
    data = request.get_json(force=True)
    required = ['name', 'current_semester', 'father_name', 'father_mobile', 'reason', 'attendance_percentage']
    for k in required:
        if k not in data:
            return jsonify({'ok': False, 'error': f'missing field {k}'}), 400
    fm = data.get('father_mobile')
    if not isinstance(fm, str) or not fm.isdigit() or not (7 <= len(fm) <= 15):
        return jsonify({'ok': False, 'error': 'father_mobile must be digits between 7 and 15 chars'}), 400

    rec_id = str(uuid.uuid4())
    rec = {'id': rec_id, **{k: data[k] for k in required}, 'created_by': user}
    RECORDS[rec_id] = rec
    logging.info('RECORD_CREATE id=%s by=%s name=%s', rec_id, user, rec['name'])
    return jsonify({'ok': True, 'record': rec})


@app.route('/api/records/<rec_id>', methods=['GET', 'PUT', 'DELETE'])
def single_record(rec_id):
    user = require_token(request)
    if not user:
        return jsonify({'ok': False, 'error': 'missing or invalid token'}), 401
    user_obj = USERS.get(user, {})
    rec = RECORDS.get(rec_id)
    if not rec:
        return jsonify({'ok': False, 'error': 'record not found'}), 404

    if request.method == 'GET':
        if user_obj.get('role') not in ('university', 'admin'):
            qname = request.args.get('name')
            if not qname or qname.lower() != rec['name'].lower():
                return jsonify({'ok': False, 'error': 'insufficient permissions to view this record'}), 403
        return jsonify({'ok': True, 'record': rec})

    if request.method == 'PUT':
        if user_obj.get('role') != 'university':
            return jsonify({'ok': False, 'error': 'only university users can edit records'}), 403
        data = request.get_json(force=True)
        allowed = ['name', 'current_semester', 'father_name', 'father_mobile', 'reason', 'attendance_percentage']
        updated = False
        for k in allowed:
            if k in data:
                rec[k] = data[k]
                updated = True
        if 'father_mobile' in data:
            fm = data.get('father_mobile')
            if not isinstance(fm, str) or not fm.isdigit() or not (7 <= len(fm) <= 15):
                return jsonify({'ok': False, 'error': 'father_mobile must be digits between 7 and 15 chars'}), 400
        if updated:
            RECORDS[rec_id] = rec
            logging.info('RECORD_EDIT id=%s by=%s updated_fields=%s', rec_id, user, list(data.keys()))
        return jsonify({'ok': True, 'record': rec})

    if request.method == 'DELETE':
        if user_obj.get('role') != 'university':
            return jsonify({'ok': False, 'error': 'only university users can delete records'}), 403
        del RECORDS[rec_id]
        logging.info('RECORD_DELETE id=%s by=%s', rec_id, user)
        return jsonify({'ok': True})


if __name__ == '__main__':
    print('Starting Student Dropout Analysis backend on 127.0.0.1:5002')
    app.run(host='127.0.0.1', port=5002, debug=False, use_reloader=False)
