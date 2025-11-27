import React from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import UniversitySignUp from './pages/UniversitySignUp'
import UniversitySignIn from './pages/UniversitySignIn'
import StudentSignUp from './pages/StudentSignUp'
import StudentSignIn from './pages/StudentSignIn'
import FacultyDashboard from './pages/FacultyDashboard'
import StudentDashboard from './pages/StudentDashboard'
import Upload from './pages/Upload'
import Results from './pages/Results'
import AdminRecords from './pages/AdminRecords'
import StudentCheck from './pages/StudentCheck'

export default function App(){
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const email = localStorage.getItem('email')
  const name = localStorage.getItem('name') || email
  const role = localStorage.getItem('role')

  // Hide nav on auth pages
  const hideNav = ['/', '/university-signin', '/university-signup', '/student-signin', '/student-signup'].includes(location.pathname)

  function signout(){
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    navigate('/')
  }

  return (
    <div>
      {!hideNav && (
        <nav className="nav">
          <Link to="/" className="brand">STUDENT DROPOUT ANALYSIS</Link>
          <div className="navlinks">
            {token ? (
              <>
                <span style={{fontSize:13, opacity:0.9}}>{name} ({role})</span>
                <button className="btn small" onClick={signout}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/">Home</Link>
              </>
            )}
          </div>
        </nav>
      )}

      <main className={hideNav ? '' : 'container'}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/university-signup" element={<UniversitySignUp/>} />
          <Route path="/university-signin" element={<UniversitySignIn/>} />
          <Route path="/student-signup" element={<StudentSignUp/>} />
          <Route path="/student-signin" element={<StudentSignIn/>} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard/>} />
          <Route path="/student-dashboard" element={<StudentDashboard/>} />
          <Route path="/upload" element={<Upload/>} />
          <Route path="/results" element={<Results/>} />
          <Route path="/admin/records" element={<AdminRecords/>} />
          <Route path="/student-check" element={<StudentCheck/>} />
        </Routes>
      </main>

      {!hideNav && <footer className="footer">Demo app — for educational use only</footer>}
    </div>
  )
}
