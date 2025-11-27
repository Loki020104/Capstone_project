# 🚀 Quick Reference - Student Dropout Analysis App

## ⚡ Start the App (3 Commands)

### Terminal 1 - Backend
```bash
cd /Users/vasif/Desktop/Capstone_project/student-dropout-web/backend
python3 app.py
```

### Terminal 2 - Frontend
```bash
cd /Users/vasif/Desktop/Capstone_project/student-dropout-web/frontend
npm run dev
```

### Browser
Open: `http://localhost:5174`

---

## 👤 Demo Login

**Faculty:**
- Email: `faculty@gmail.com`
- Password: `test123`

**Student:**
- Email: `student@example.com`  
- Password: `test123`

---

## 🔄 Typical Session (5 Minutes)

1. **Sign In** (30 sec) → Click "🏫 University Login" → Enter credentials
2. **Upload CSV** (30 sec) → Click "📤 Upload" → Select file → Click button
3. **View Results** (2 min) → Figures load + See student details table
4. **Manage Records** (2 min) → Go to Dashboard → Create/Edit records

---

## 📊 What You'll See

**After Upload:**
- ✅ 5 Analysis Figures (charts)
- ✅ At-Risk Students Table with:
  - Student Name
  - Father's Name
  - Semester
  - Attendance %
  - Reason for Dropout/Sem Back

**Total Students:** ~300  
**At-Risk Students:** ~80 (Dropout + Semester Back)

---

## 🔧 Common Issues

| Issue | Fix |
|-------|-----|
| 401 Error | Sign in again |
| Backend offline | Run `python3 app.py` |
| Can't connect | Check port 5002 |
| Port in use | Kill: `lsof -i :5002 \| xargs kill -9` |

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/app.py` | Flask API |
| `frontend/src/pages/Upload.jsx` | Upload page |
| `frontend/src/pages/Results.jsx` | Results + table |
| `backend/logs/actions.log` | Audit log |
| `backend/data.csv` | Uploaded file |
| `backend/static/results/` | Generated figures |

---

## 🎯 Features

✓ User signup/signin  
✓ CSV upload  
✓ Analysis execution  
✓ Student details table  
✓ Record management  
✓ Role-based access  
✓ Audit logging

---

## 📞 Health Check

```bash
# Backend running?
ps aux | grep "python3 app.py"

# Can access API?
curl -s http://127.0.0.1:5002/api/results \
  -H "Authorization: demo-faculty-token"

# View logs?
tail -50 backend/logs/actions.log
```

---

**That's it!** Your app is ready to use! 🎓
