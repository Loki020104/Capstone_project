import React, {useState} from 'react'

export default function StudentCheck(){
  const [name,setName] = useState('')
  const [result,setResult] = useState(null)
  const [err,setErr] = useState('')

  async function submit(e){
    e.preventDefault()
    setErr('')
    try{
      const token = localStorage.getItem('token')
      const q = encodeURIComponent(name)
  const res = await fetch(`http://127.0.0.1:5002/api/records?name=${q}`, {headers:{'Authorization': token}})
      const j = await res.json()
      if(!j.ok) return setErr(j.error || 'failed')
      if(j.records.length===0) setResult({found:false})
      else setResult({found:true, records:j.records})
    }catch(e){ setErr(String(e)) }
  }

  return (
    <div className="card" style={{maxWidth:700}}>
      <h2>Student Check</h2>
      <p>Enter your full name to see dropout record details (if any).</p>
      <form onSubmit={submit}>
        <div className="form-row">
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" required />
        </div>
        <button className="btn" type="submit">Check</button>
      </form>

      {err && <div style={{color:'red'}}>{err}</div>}
      {result && result.found && (
        <div style={{marginTop:16}}>
          <h3>Records</h3>
          <div className="grid">
            {result.records.map(r=> (
              <div key={r.id} className="card">
                <div><strong>{r.name}</strong></div>
                <div>Semester: {r.current_semester}</div>
                <div>Father: {r.father_name}</div>
                <div>Father Mobile: {r.father_mobile}</div>
                <div>Attendance: {r.attendance_percentage}</div>
                <div>Reason: {r.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {result && !result.found && <div className="small-muted" style={{marginTop:12}}>No records found for that name.</div>}
    </div>
  )
}
