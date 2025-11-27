import React, {useEffect, useState} from 'react'

function validateMobile(m){
  // Client-side father mobile validation: digits only, 7-15 length
  return /^\d{7,15}$/.test(m)
}

export default function AdminRecords(){
  const [records, setRecords] = useState([])
  const [err, setErr] = useState('')
  const [form, setForm] = useState({name:'', current_semester:'', father_name:'', father_mobile:'', reason:'', attendance_percentage:''})
  const token = localStorage.getItem('token')

  async function load(){
    setErr('')
    try{
  const res = await fetch('http://127.0.0.1:5002/api/records', {headers:{'Authorization':token}})
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'failed')
      else setRecords(j.records)
    }catch(e){ setErr(String(e)) }
  }

  useEffect(()=>{ load() }, [])

  async function create(e){
    e.preventDefault()
    setErr('')
    if(!validateMobile(form.father_mobile)) return setErr('Father mobile must be digits (7-15 chars)')
    try{
  const res = await fetch('http://127.0.0.1:5002/api/records', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':token}, body:JSON.stringify(form)
      })
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'create failed')
      else{ setForm({name:'', current_semester:'', father_name:'', father_mobile:'', reason:'', attendance_percentage:''}); load() }
    }catch(e){ setErr(String(e)) }
  }

  async function del(id){
    if(!confirm('Delete record?')) return
    try{
  const res = await fetch(`http://127.0.0.1:5002/api/records/${id}`, {method:'DELETE', headers:{'Authorization':token}})
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'delete failed')
      else load()
    }catch(e){ setErr(String(e)) }
  }

  async function edit(rec){
    const newName = prompt('Edit name', rec.name)
    if(newName==null) return
    try{
  const res = await fetch(`http://127.0.0.1:5002/api/records/${rec.id}`, {method:'PUT', headers:{'Content-Type':'application/json','Authorization':token}, body:JSON.stringify({name:newName})})
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'edit failed')
      else load()
    }catch(e){ setErr(String(e)) }
  }

  return (
    <div>
      <div className="card">
        <h2>Manage Student Records</h2>
        {err && <div style={{color:'red'}}>{err}</div>}
        <form onSubmit={create} style={{maxWidth:720}}>
          <div className="form-row"><label>Name</label><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
          <div className="form-row"><label>Current Semester</label><input className="input" value={form.current_semester} onChange={e=>setForm({...form,current_semester:e.target.value})} required/></div>
          <div className="form-row"><label>Father Name</label><input className="input" value={form.father_name} onChange={e=>setForm({...form,father_name:e.target.value})} required/></div>
          <div className="form-row"><label>Father Mobile</label><input className="input" value={form.father_mobile} onChange={e=>setForm({...form,father_mobile:e.target.value})} required placeholder="digits only"/></div>
          <div className="form-row"><label>Reason for dropout</label><input className="input" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} /></div>
          <div className="form-row"><label>Attendance percentage</label><input className="input" value={form.attendance_percentage} onChange={e=>setForm({...form,attendance_percentage:e.target.value})} required/></div>
          <button className="btn" type="submit">Create Record</button>
        </form>
      </div>

      <div className="card">
        <h3>Existing Records</h3>
        <table className="table">
          <thead><tr><th>Name</th><th>Semester</th><th>Father</th><th>Mobile</th><th>Attendance</th><th>Actions</th></tr></thead>
          <tbody>
            {records.map(r=> (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.current_semester}</td>
                <td>{r.father_name}</td>
                <td>{r.father_mobile}</td>
                <td>{r.attendance_percentage}</td>
                <td>
                  <button className="btn small" onClick={()=>edit(r)}>Edit</button>
                  <button className="btn small" style={{background:'#ff4d4f'}} onClick={()=>del(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {records.length===0 && <tr><td colSpan={6} className="small-muted">No records yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
