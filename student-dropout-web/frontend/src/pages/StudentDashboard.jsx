import React, {useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function StudentDashboard(){
  const [name, setName] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')
  const storedEmail = localStorage.getItem('email')
  const headerName = localStorage.getItem('name') || storedEmail
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setErr('')
    setResult(null)
    setLoading(true)
    try{
      const q = encodeURIComponent(name)
      const res = await fetch(`http://127.0.0.1:5002/api/records?name=${q}`, {headers:{'Authorization': token}})
      const j = await res.json()
      if(!j.ok) return setErr(j.error || 'Failed to fetch records')
      if(j.records.length===0) setResult({found:false})
      else setResult({found:true, records:j.records})
    }catch(e){ setErr('Network error: ' + String(e)) }
    finally{ setLoading(false) }
  }

  function signout(){
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('name')
    localStorage.removeItem('role')
    navigate('/')
  }

  return (
    <div>
      <nav className="nav">
        <Link to="/" className="brand">STUDENT DROPOUT ANALYSIS</Link>
        <div className="navlinks">
          <span style={{fontSize:13, opacity:0.9}}>👨‍🎓 {headerName}</span>
          <button className="btn small" onClick={signout}>Sign Out</button>
        </div>
      </nav>

      <div className="container">
        <div className="card" style={{maxWidth:700, margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:24}}>
            <div style={{fontSize:56, marginBottom:12}}>🔍</div>
            <h2>Check Your Academic Status</h2>
            <p style={{margin:'4px 0 0', color:'#666', fontSize:14}}>Enter your full name exactly as registered with the university</p>
          </div>

          <form onSubmit={submit}>
            <div className="form-row">
              <label>Your Full Name *</label>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name" required />
            </div>
            {err && <div style={{color:'#dc2626', fontSize:13, marginBottom:12, padding:12, background:'#fee2e2', borderRadius:10, border:'1px solid #fecaca'}}><strong>⚠️</strong> {err}</div>}
            <button className="btn" type="submit" style={{width:'100%', background:'linear-gradient(135deg,#14b8a6,#06b6d4)', fontSize:15, padding:14}}>
              {loading ? '🔄 Searching...' : '🔍 Check Status'}
            </button>
          </form>
        </div>

        {result && result.found && (
          <div className="card" style={{maxWidth:700, margin:'24px auto 0'}}>
            <h2 style={{color:'#dc2626', display:'flex', alignItems:'center', gap:8}}>⚠️ Record Found</h2>
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              {result.records.map(r=> (
                <div key={r.id} style={{border:'2px solid #fca5a5', borderRadius:12, padding:20, background:'linear-gradient(135deg,#fff7ed,#fef3c7)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:16}}>
                    <h3 style={{margin:0, color:'#b91c1c'}}>{r.name}</h3>
                    <div style={{
                      padding:'6px 12px',
                      borderRadius:'6px',
                      fontSize:'13px',
                      fontWeight:'700',
                      background: r.status === 'Dropout' ? '#fee2e2' : '#fef3c7',
                      color: r.status === 'Dropout' ? '#991b1b' : '#92400e',
                      border: r.status === 'Dropout' ? '1px solid #fecaca' : '1px solid #fcd34d'
                    }}>
                      {r.status === 'Dropout' ? '🔴 Dropout' : '🟠 Semester Back'}
                    </div>
                  </div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, fontSize:14}}>
                    <div>
                      <p style={{margin:'0 0 4px', fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#666', letterSpacing:0.5}}>Current Semester</p>
                      <p style={{margin:0, fontSize:16, fontWeight:700, color:'#1f2937'}}>{r.current_semester}</p>
                    </div>
                    <div>
                      <p style={{margin:'0 0 4px', fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#666', letterSpacing:0.5}}>Attendance</p>
                      <p style={{margin:0, fontSize:16, fontWeight:700, color:r.attendance_percentage < 75 ? '#dc2626' : '#16a34a'}}>{r.attendance_percentage}%</p>
                    </div>
                    <div>
                      <p style={{margin:'0 0 4px', fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#666', letterSpacing:0.5}}>Father Name</p>
                      <p style={{margin:0, fontSize:14, color:'#1f2937'}}>{r.father_name}</p>
                    </div>
                    <div>
                      <p style={{margin:'0 0 4px', fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#666', letterSpacing:0.5}}>Contact</p>
                      <p style={{margin:0, fontSize:14, color:'#1f2937'}}>{r.father_mobile || '-'}</p>
                    </div>
                    <div style={{gridColumn:'1/-1'}}>
                      <p style={{margin:'0 0 4px', fontSize:12, fontWeight:700, textTransform:'uppercase', color:'#666', letterSpacing:0.5}}>Reason</p>
                      <p style={{margin:0, fontSize:14, color:'#1f2937', padding:10, background:'white', borderRadius:8, borderLeft:'4px solid #dc2626'}}>{r.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {result && !result.found && (
          <div className="card" style={{maxWidth:700, margin:'24px auto 0', background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border:'2px solid #86efac'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:56, marginBottom:12}}>✅</div>
              <h2 style={{color:'#166534', margin:'0 0 8px'}}>Great News!</h2>
              <p style={{margin:0, color:'#15803d', fontSize:14}}>No semester back or dropout records found for <strong>{name}</strong>. You are on track with your academics! Keep up the good work! 🎉</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
