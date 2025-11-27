# STUDENT DROPOUT ANALYSIS

This project is a simple demo web app that wraps an existing Python analysis script (`backend/analysis.py`) and exposes it via a Flask backend and a React+Vite frontend.

Important: `backend/analysis.py` is included as-is and must not be modified by the wrapper.

Structure
- `backend/` - Flask backend, wrapper, and Python dependencies
- `frontend/` - Vite + React frontend (dev server on port 5173)

Requirements
- macOS (zsh)
- Python 3.8+ installed (python3)
- Node.js + npm for frontend

Quick start (macOS, zsh)

1) Start the backend

```bash
cd /Users/vasif/Desktop/Capstone_project/student-dropout-web/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

This starts the Flask backend on http://127.0.0.1:5000

2) Start the frontend (in a new terminal)

```bash
cd /Users/vasif/Desktop/Capstone_project/student-dropout-web/frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173 in your browser.

Typical flow
- Sign up (Sign Up page) — creates an in-memory user (demo only)
- Sign in (Sign In page) — saves returned token and email to localStorage
- Upload (Upload page) — choose a CSV file and upload it to the backend. The backend saves it as `backend/data.csv`, clears `backend/static/results/` and runs `run_analysis_wrapper.py` as a subprocess. Any matplotlib figures created by `analysis.py` are saved to `backend/static/results/` as `figure_1.png`, `figure_2.png`, ...
- Results (Results page) — shows the images produced by `analysis.py`.

Notes & troubleshooting
- If you see "No data.csv found" in server logs, upload a CSV via the Upload page.
- The upload endpoint returns `stdout` and `stderr` from running the wrapper; if the analysis script fails, inspect the returned `stderr` to debug.
- This demo uses an in-memory user store and unencrypted passwords. Do NOT use this in production.
- If port 5000 is already in use on macOS, either stop the service using it or change the port in `backend/app.py` and update frontend fetch URLs accordingly.

Files added/important
- `backend/app.py` — Flask API (signup/signin/upload/results)
- `backend/run_analysis_wrapper.py` — runs `analysis.py` and saves matplotlib figures to `backend/static/results/`
- `backend/requirements.txt` — Python dependencies
- `frontend/` — Vite + React frontend with pages: Home, SignUp, SignIn, Profile, Upload, Results

Security
- This project is a demo. For production use: store hashed passwords, use HTTPS, persistent DB, authentication tokens with expiry, and sanitize inputs.

If you want, I can also:
- Add unit tests for the backend endpoints
- Persist users/records to a simple SQLite DB
- Improve the frontend UX
# STUDENT DROPOUT ANALYSIS — Web Application

A complete web application for managing and analyzing student dropout risk. Faculty (University) can manage student records and track semester back / dropout cases. Students can check their status by entering their name.

**Demo Notice:** This application uses in-memory authentication for demo purposes only. It is NOT secure for production use.

---

## 🎯 Features

✅ **Separate University & Student Logins**
- Faculty can sign up/in with university role to manage records
- Students can sign up/in to check their dropout risk status

✅ **Faculty Upload & Results**
- Only University users can upload CSV datasets
- Only University users can view the analysis results (figures)
- Only University users can manage student records (create/edit/delete)
- Students cannot access upload, results, or record management

✅ **Student Dashboard**
- Enter your full name to search for your records
- View detailed dropout/semester back information if a record exists
- If no record found, see "on track" message

✅ **Backend Features**
- Token-based in-memory authentication (demo)
- RESTful API for records CRUD
- Server-side logging to `backend/logs/actions.log` for audit trail
- Wrapper that runs provided analysis.py and saves matplotlib figures
- Upload CSV endpoint for data analysis

---

## 📁 Project Structure

```
student-dropout-web/
├── backend/
│   ├── app.py                      # Flask app with API endpoints
│   ├── run_analysis_wrapper.py     # Runs analysis.py and saves figures
│   ├── analysis.py                 # Analysis script (provided, unchanged)
│   ├── requirements.txt
│   ├── logs/                       # Server-side action logs
│   └── static/results/             # Generated analysis figures
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── styles.css
│       └── pages/
│           ├── Home.jsx                    # Hero with University/Student buttons
│           ├── UniversitySignUp.jsx        # Faculty registration
│           ├── UniversitySignIn.jsx        # Faculty login
│           ├── StudentSignUp.jsx           # Student registration
│           ├── StudentSignIn.jsx           # Student login
│           ├── FacultyDashboard.jsx        # Record management (create/edit/delete)
│           ├── StudentDashboard.jsx        # Student status checker
│           ├── Upload.jsx
│           ├── Results.jsx
│           ├── AdminRecords.jsx
│           └── StudentCheck.jsx
└── README.md
```

---

## 🚀 Quick Start (macOS, zsh)

### Backend Setup

```bash
cd /Users/vasif/Desktop/Capstone_project/student-dropout-web/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

The Flask server will start on `http://127.0.0.1:5002` (macOS uses 5002 to avoid port conflicts).

### Frontend Setup

Open another terminal:

```bash
cd /Users/vasif/Desktop/Capstone_project/student-dropout-web/frontend
npm install
npm run dev
```

Vite dev server will start (usually at `http://127.0.0.1:5173`). Open the URL in your browser.

---

## 📖 How to Use

### 1. **Faculty (University) Workflow**

**Sign Up:**
- Go to Home page
- Click **"🏫 University Login"**
- Click **"Register here"** to create a faculty account
- Enter faculty email and password (min. 6 chars)
- Submit to create account

**Sign In:**
- Click **"🏫 University Login"**
- Enter credentials
- Redirected to **Faculty Dashboard**

**Upload Dataset & View Results:**
- After signing in, navigate to **Upload** page
- Choose a CSV file and upload it
- The backend runs the analysis script and generates figures (saved as `figure_1.png`, `figure_2.png`, etc.)
- Navigate to **Results** page to view all generated analysis figures
- **Only University/Faculty users can upload and view results** — Students cannot access these pages

**Manage Records:**
- **Add Record:** Fill out the form with student details:
  - Student Name (required)
  - Current Semester (required)
  - Father Name (required)
  - Father Mobile: digits only, 7–15 characters (client-side validation happens before submit)
  - Attendance Percentage: 0–100 (required)
  - Reason for Semester Back (required)
  - Click **"➕ Add Record"**

- **Edit Record:** Click **"✏️ Edit"** on any row, modify fields, click **"💾 Save"**

- **Delete Record:** Click **"🗑️ Delete"**, confirm, record removed

All actions are logged to `backend/logs/actions.log` for audit trail.

### 2. **Student Workflow**

**Sign Up:**
- Go to Home page
- Click **"👨‍🎓 Student Login"**
- Click **"Register here"** to create a student account
- Enter email and password
- Submit to create account

**Sign In:**
- Click **"👨‍🎓 Student Login"**
- Enter credentials
- Redirected to **Student Dashboard**

**Check Status:**
- Enter your full name exactly as recorded by faculty
- Click **"🔍 Check Status"**
- View your record if it exists, or see "✅ Good News!" if no record found

---

## 🔐 Access Control Matrix

| Feature | University | Student |
|---------|-----------|---------|
| **Upload Dataset** | ✅ Yes | ❌ No |
| **View Results** | ✅ Yes | ❌ No |
| **Create Records** | ✅ Yes | ❌ No |
| **Edit Records** | ✅ Yes | ❌ No |
| **Delete Records** | ✅ Yes | ❌ No |
| **View Own Record** | ✅ Yes | ✅ By Name |
| **List All Records** | ✅ Yes | ❌ No |

### Client-Side Validation
- **Father Mobile:** Must contain only digits, 7–15 characters
  - Example: `9876543210` ✓
  - Example: `+91-98765-43210` ✗ (contains non-digits)

### Server-Side Validation
- Father mobile is re-validated on the backend (digits, 7–15 chars)
- All required fields are checked before record creation/edit
- Authentication required for all protected endpoints

### Important Notes
- **Demo Only:** Passwords stored in plain text in-memory (NOT secure)
- **No Database:** All data lives in process memory; data is lost on server restart
- **For Production:** Use bcrypt for password hashing, PostgreSQL or MongoDB for persistence, JWT or secure session tokens, HTTPS/SSL

---

## 📊 Server-Side Logging

All user signups and record actions are logged to `backend/logs/actions.log`:

```
2025-11-16 10:30:45,123 - INFO - USER_SIGNUP email=faculty@uni.edu role=university
2025-11-16 10:31:12,456 - INFO - RECORD_CREATE id=abc-123 by=faculty@uni.edu name=John Doe
2025-11-16 10:32:00,789 - INFO - RECORD_EDIT id=abc-123 by=faculty@uni.edu updated_fields=['attendance_percentage']
2025-11-16 10:33:45,012 - INFO - RECORD_DELETE id=abc-123 by=faculty@uni.edu
```

---

## 🧪 Basic Smoke Tests (curl)

Start the backend first, then run these commands in a terminal:

### 1. Faculty Sign Up
```bash
curl -X POST http://127.0.0.1:5002/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty@uni.edu","password":"pass123","role":"university"}'
```

### 2. Faculty Sign In (get token)
```bash
curl -X POST http://127.0.0.1:5002/api/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty@uni.edu","password":"pass123"}'
```

Copy the returned `token` value. Let's call it `<TOKEN>`.

### 3. Create a Record
```bash
curl -X POST http://127.0.0.1:5002/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: <TOKEN>" \
  -d '{
    "name":"John Doe",
    "current_semester":"4",
    "father_name":"Bob Doe",
    "father_mobile":"9876543210",
    "reason":"Financial issues",
    "attendance_percentage":"65"
  }'
```

Copy the returned `id` from the record response.

### 4. List Records (Faculty only)
```bash
curl -H "Authorization: <TOKEN>" \
  http://127.0.0.1:5002/api/records
```

### 5. Edit a Record (replace <ID>)
```bash
curl -X PUT http://127.0.0.1:5002/api/records/<ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: <TOKEN>" \
  -d '{"attendance_percentage":"72"}'
```

### 6. Delete a Record (replace <ID>)
```bash
curl -X DELETE http://127.0.0.1:5002/api/records/<ID> \
  -H "Authorization: <TOKEN>"
```

### 7. View Results (Faculty only - restricted)
```bash
curl -H "Authorization: <TOKEN>" \
  http://127.0.0.1:5002/api/results
```

### 8. Student Sign In and Search
```bash
curl -X POST http://127.0.0.1:5002/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"pass123","role":"student"}'

curl -X POST http://127.0.0.1:5002/api/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"pass123"}'
```

Copy the returned token, then search for a record by name:

```bash
curl -H "Authorization: <STUDENT_TOKEN>" \
  "http://127.0.0.1:5002/api/records?name=John%20Doe"
```

### 9. Student tries to view results (will be denied)
```bash
curl -H "Authorization: <STUDENT_TOKEN>" \
  http://127.0.0.1:5002/api/results
```

Expected response: `{"ok":false,"error":"only university users can view results"}` (403)

---

## 🐛 Troubleshooting

### "Failed to connect to backend"
- Ensure Flask backend is running on `127.0.0.1:5000`
- Check firewall settings (macOS may block ports)

### "Father mobile must be digits"
- Client-side validation rejects non-digit characters
- Use only numbers: `9876543210` (not `98-765-43210` or `+91 98765 43210`)

### No figures appear after upload
- Check the upload API response for `stdout` and `stderr`
- Ensure your analysis.py creates matplotlib figures with `plt.figure()`, `plt.plot()`, etc.
- Check `backend/logs/actions.log` for any upload errors

### "Insufficient permissions"
- Students can only view their own records by name
- Only faculty (university/admin role) can list all records, create, edit, or delete

---

## 📝 Notes

- The provided `backend/analysis.py` is left as-is (do NOT modify)
- The wrapper (`run_analysis_wrapper.py`) runs analysis.py and saves any matplotlib figures to `backend/static/results/`
- Client-side validation happens in the form; server-side validation is a safety check
- All record timestamps and user actions are logged for audit purposes

---

## 🚨 Important: Production Readiness

This demo is NOT suitable for production. Before deploying:

1. **Use a real database** (PostgreSQL, MongoDB, etc.)
2. **Hash passwords** with bcrypt or similar
3. **Use JWT** or secure session tokens instead of simple UUID
4. **Enable HTTPS/SSL** for all communications
5. **Add rate limiting** to prevent abuse
6. **Implement proper CORS** policies
7. **Add email verification** for user sign-ups
8. **Set up backup and recovery** procedures
9. **Add comprehensive error handling** and monitoring
10. **Conduct security audit** before any production use

---

## 📬 Support

If you encounter issues, check:
1. Backend logs: `backend/logs/actions.log`
2. Browser console (F12) for frontend errors
3. Flask console output for API errors
4. Father mobile format: must be digits only, 7–15 chars

Good luck! 🎓
