import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState('')
  const [studentNames, setStudentNames] = useState([])
  const navigate = useNavigate()
  const storedEmail = localStorage.getItem('email')
  const name = localStorage.getItem('name') || storedEmail
  
  // Auto-refresh token on page load if it expired
  useEffect(() => {
    async function refreshTokenIfNeeded() {
      const token = localStorage.getItem('token')
      const storedEmail = localStorage.getItem('email')
      const storedPassword = localStorage.getItem('password')
      
      if (!token && storedEmail && storedPassword) {
        // Try to sign in again
        try {
          const res = await fetch('http://127.0.0.1:5002/api/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: storedEmail, password: storedPassword })
          })
          const j = await res.json()
          if (j.ok && j.token) {
            localStorage.setItem('token', j.token)
          }
        } catch (e) {
          console.error('Failed to refresh token:', e)
        }
      }
    }
    refreshTokenIfNeeded()
  }, [])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    if (!file) return setErr('Please choose a CSV file')
    const token = localStorage.getItem('token')
    if (!token) {
      setErr('Not signed in - please login first')
      return
    }

    const fd = new FormData()
    fd.append('file', file)

    try {
      console.log('Uploading with token:', token.substring(0, 10) + '...')
      const xhr = new XMLHttpRequest()
      xhr.open('POST', 'http://127.0.0.1:5002/api/upload')
      xhr.setRequestHeader('Authorization', token)
      xhr.withCredentials = true
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        if (xhr.status === 200) {
          const j = JSON.parse(xhr.responseText)
          if (j.ok) {
            // Store upload response data for Results page
            localStorage.setItem('upload_response', JSON.stringify({
              has_student_details: j.has_student_details || false,
              student_details: j.student_details || [],
              results: j.results || []
            }))
            setStudentNames(j.student_details?.map(s => s.name) || [])
            // Automatically navigate to results page after 2 seconds
            setTimeout(() => {
              navigate('/results')
            }, 2000)
          }
          else setErr(j.error || 'upload failed')
        } else if (xhr.status === 401) {
          setErr('Session expired. Please sign in again to refresh your token.')
        } else {
          setErr('Upload failed: ' + xhr.status)
        }
      }
      xhr.onerror = () => setErr('Network error')
      xhr.send(fd)
    } catch (e) { setErr(String(e)) }
  }

  return (
    <div>
      <nav className="nav">
        <div className="brand">📤 Upload CSV Dataset</div>
        <div className="navlinks" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/faculty-dashboard" style={{ color: '#0066cc', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>📋 Back to Dashboard</Link>
          <Link to="/results" style={{ color: '#0066cc', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>📊 View Results</Link>
          <span style={{ fontSize: 13, opacity: 0.9 }}>{name}</span>
        </div>
      </nav>

      <div className="container">
        <div className="card" style={{ maxWidth: 640 }}>
          <h2>Upload CSV Dataset</h2>
          <form onSubmit={submit}>
            <div className="form-row">
              <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
            </div>
            <div className="form-row">
              <div style={{ width: '100%', background: '#f2f2f5', height: 10, borderRadius: 6 }}>
                <div style={{ width: `${progress}%`, height: 10, background: 'linear-gradient(90deg,#5b62ff,#b14fed)', borderRadius: 6 }}></div>
              </div>
            </div>
            {err && <div style={{ color: 'red' }}>{err}</div>}
            <button className="btn" type="submit">Upload & Run Analysis</button>
          </form>

          {studentNames.length > 0 && (
            <div style={{ marginTop: 24, padding: 16, background: '#fff3cd', borderRadius: 8, border: '2px solid #ffc107' }}>
              <h3 style={{ marginTop: 0, color: '#d32f2f' }}>⚠️ At-Risk Students Detected!</h3>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
                <strong>{studentNames.length}</strong> students are at risk of <strong>Dropout</strong> or <strong>Semester Back</strong>:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, maxHeight: 300, overflowY: 'auto', padding: '10px 0' }}>
                {studentNames.map((name, idx) => (
                  <div key={idx} style={{ padding: 10, background: 'white', borderRadius: 4, border: '1px solid #ffc107', fontSize: 13, fontWeight: '500' }}>
                    � {name}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, opacity: 0.8, marginTop: 12, marginBottom: 12, padding: '8px', background: '#ffe8cc', borderRadius: '4px' }}>
                ✓ Faculty should review and enter details for these students in the records section
              </p>
              <button 
                onClick={() => navigate('/results')}
                style={{
                  background: 'linear-gradient(90deg, #5b62ff, #b14fed)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                📊 View Analysis Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
