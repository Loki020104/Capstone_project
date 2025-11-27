import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'

export default function Results(){
  const [files,setFiles]=useState([])
  const [err,setErr]=useState('')
  const [hasStudentDetails, setHasStudentDetails] = useState(false)
  const [studentDetails, setStudentDetails] = useState([])
  const email = localStorage.getItem('email')
  const name = localStorage.getItem('name') || email

  useEffect(()=>{
    async function load(){
      setErr('')
      const token = localStorage.getItem('token')
      if(!token){ setErr('Sign in to view results'); return }
      
      // Load upload response from localStorage
      const uploadResp = localStorage.getItem('upload_response')
      if (uploadResp) {
        try {
          const data = JSON.parse(uploadResp)
          setHasStudentDetails(data.has_student_details || false)
          setStudentDetails(data.student_details || [])
          setFiles(data.results || [])
          return
        } catch (e) {}
      }
      
      // Fallback to API call
      try{
        const res = await fetch('http://127.0.0.1:5002/api/results', {headers:{'Authorization': token}})
        const j = await res.json()
        if(j.ok) setFiles(j.results)
        else setErr(j.error || 'Failed')
      }catch(e){ setErr(e.message) }
    }
    load()
  },[])

  return (
    <div>
      <nav className="nav">
        <div className="brand">📊 Analysis Results</div>
        <div className="navlinks" style={{display:'flex', gap:16, alignItems:'center'}}>
          <Link to="/faculty-dashboard" style={{color:'#0066cc', textDecoration:'none', fontSize:14, fontWeight:500}}>📋 Dashboard</Link>
          <Link to="/upload" style={{color:'#0066cc', textDecoration:'none', fontSize:14, fontWeight:500}}>📤 Upload New Dataset</Link>
          <span style={{fontSize:13, opacity:0.9}}>{name}</span>
        </div>
      </nav>

      <div className="container">
        {/* Student Details Table */}
        {hasStudentDetails && studentDetails.length > 0 && (
          <div className="card" style={{marginBottom: 24}}>
            <h2>📋 At-Risk Student Details</h2>
            <div style={{overflowX: 'auto'}}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14
              }}>
                <thead>
                  <tr style={{background: '#f5f5f5', borderBottom: '2px solid #ddd'}}>
                    <th style={{padding: 12, textAlign: 'left', fontWeight: 600}}>Student Name</th>
                    <th style={{padding: 12, textAlign: 'left', fontWeight: 600}}>Father Name</th>
                    <th style={{padding: 12, textAlign: 'left', fontWeight: 600}}>Father Mobile</th>
                    <th style={{padding: 12, textAlign: 'left', fontWeight: 600}}>Semester</th>
                    <th style={{padding: 12, textAlign: 'left', fontWeight: 600}}>Attendance %</th>
                    <th style={{padding: 12, textAlign: 'left', fontWeight: 600}}>Reason</th>
                    <th style={{padding: 12, textAlign: 'left', fontWeight: 600}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentDetails.map((student, idx) => (
                    <tr key={idx} style={{borderBottom: '1px solid #eee'}}>
                      <td style={{padding: 12}}><strong>{student.name}</strong></td>
                      <td style={{padding: 12}}>{student.father_name || '-'}</td>
                      <td style={{padding: 12}}>{student.father_mobile || '-'}</td>
                      <td style={{padding: 12}}>{student.semester || '-'}</td>
                      <td style={{padding: 12}}>{student.attendance_percentage || '-'}</td>
                      <td style={{padding: 12, maxWidth: 250, wordBreak: 'break-word'}}>{student.reason_for_sem_back || '-'}</td>
                      <td style={{padding: 12, fontWeight: 600, color: student.target === 'Dropout' ? '#d32f2f' : '#ff9800'}}>
                        {student.target === 'Dropout' ? '🔴 Dropout' : '🟠 Semester Back'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{fontSize: 12, marginTop: 12, opacity: 0.8}}>
              💡 Tip: Click "📋 Dashboard" to manage and enter additional details for these students.
            </p>
          </div>
        )}

        {/* Analysis Figures */}
        <div className="card">
          <h2>📊 Analysis Results</h2>
          {err && <div style={{color:'red', padding:12, background:'#fee2e2', borderRadius:6, marginBottom:16}}>{err}</div>}
          <div className="results-grid">
            {files.map(f=> (
              <div className="result-card" key={f}>
                <a href={`http://127.0.0.1:5002/results/${f}`} target="_blank" rel="noreferrer">
                  <img src={`http://127.0.0.1:5002/results/${f}`} alt={f} />
                </a>
                <div className="filename">{f}</div>
              </div>
            ))}
            {!err && files.length===0 && <div style={{gridColumn:'1/-1', textAlign:'center', padding:40}}>No results yet. <Link to="/upload">Upload a dataset</Link> to run the analysis.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
