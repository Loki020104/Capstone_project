import React, {useEffect, useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function FacultyDashboard(){
  function validateMobile(m){
    return /^\d{7,15}$/.test(m)
  }
  const [records, setRecords] = useState([])
  const [err, setErr] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [form, setForm] = useState({name:'', current_semester:'', father_name:'', father_mobile:'', reason:'', attendance_percentage:''})
  const [searchName, setSearchName] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const token = localStorage.getItem('token')
  const email = localStorage.getItem('email')
  const name = localStorage.getItem('name') || email
  const navigate = useNavigate()

  async function searchStudent(e){
    e.preventDefault()
    setErr('')
    setSearchResult(null)
    if(!searchName.trim()) return
    try{
      const q = encodeURIComponent(searchName.trim())
      const res = await fetch(`http://127.0.0.1:5002/api/records?name=${q}`, {headers:{'Authorization':token}})
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'Failed to fetch records')
      else if(j.records.length===0) setSearchResult({found:false})
      else setSearchResult({found:true, records:j.records})
    }catch(e){ setErr('Network error: ' + String(e)) }
  }

  async function load(){
    setErr('')
    try{
      const res = await fetch('http://127.0.0.1:5002/api/records', {headers:{'Authorization':token}})
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'Failed to load records')
      else setRecords(j.records)
    }catch(e){ setErr('Network error: ' + String(e)) }
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
      if(!j.ok) setErr(j.error || 'Create failed')
      else{ 
        setForm({name:'', current_semester:'', father_name:'', father_mobile:'', reason:'', attendance_percentage:''})
        load() 
      }
    }catch(e){ setErr('Network error: ' + String(e)) }
  }

  async function del(id){
    if(!confirm('Delete this record? This action cannot be undone.')) return
    try{
      const res = await fetch(`http://127.0.0.1:5002/api/records/${id}`, {method:'DELETE', headers:{'Authorization':token}})
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'Delete failed')
      else load()
    }catch(e){ setErr('Network error: ' + String(e)) }
  }

  async function saveEdit(rec){
    if(!validateMobile(editForm.father_mobile)) return setErr('Father mobile must be digits (7-15 chars)')
    try{
      const res = await fetch(`http://127.0.0.1:5002/api/records/${rec.id}`, {
        method:'PUT', headers:{'Content-Type':'application/json','Authorization':token}, body:JSON.stringify(editForm)
      })
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'Edit failed')
      else{ setEditing(null); load() }
    }catch(e){ setErr('Network error: ' + String(e)) }
  }

  function startEdit(rec){
    setEditing(rec.id)
    setEditForm({...rec})
  }

  function signout(){
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('role')
    navigate('/')
  }

  return (
    <div>
      <nav className="nav">
        <div className="brand">🏫 STUDENT DROPOUT ANALYSIS — Faculty Dashboard</div>
        <div className="navlinks" style={{display:'flex', gap:16, alignItems:'center'}}>
          <Link to="/upload" style={{color:'#0066cc', textDecoration:'none', fontSize:14, fontWeight:500}}>📤 Upload Dataset</Link>
          <Link to="/results" style={{color:'#0066cc', textDecoration:'none', fontSize:14, fontWeight:500}}>📊 View Results</Link>
          <span style={{fontSize:13, opacity:0.9}}>{name}</span>
          <button className="btn small" onClick={signout}>Sign Out</button>
        </div>
      </nav>

      <div className="container">
        {/* Search Student by Name */}
        <div className="card" style={{maxWidth:600, margin:'0 auto 24px'}}>
          <h2>🔍 Search Student Details</h2>
          <form onSubmit={searchStudent} style={{display:'flex', gap:12, alignItems:'center'}}>
            <input className="input" value={searchName} onChange={e=>setSearchName(e.target.value)} placeholder="Enter student name" style={{flex:1}} required />
            <button className="btn" type="submit">Search</button>
          </form>
          {searchResult && searchResult.found && (
            <div style={{marginTop:20}}>
              {searchResult.records.map(r => (
                <div key={r.id} style={{border:'2px solid #6366f1', borderRadius:12, padding:20, background:'#f3f4f6', marginBottom:16}}>
                  <h3 style={{margin:0, color:'#3730a3'}}>{r.name}</h3>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, fontSize:14}}>
                    <div><strong>Semester:</strong> {r.current_semester}</div>
                    <div><strong>Attendance:</strong> {r.attendance_percentage}%</div>
                    <div><strong>Father Name:</strong> {r.father_name}</div>
                    <div><strong>Father Mobile:</strong> {r.father_mobile || '-'}</div>
                    <div style={{gridColumn:'1/-1'}}><strong>Reason:</strong> {r.reason}</div>
                  </div>
                  <div style={{marginTop:12}}>
                    <span style={{padding:'6px 12px', borderRadius:'6px', fontWeight:'700', background:r.status==='Dropout'?'#fee2e2':'#fef3c7', color:r.status==='Dropout'?'#991b1b':'#92400e', border:r.status==='Dropout'?'1px solid #fecaca':'1px solid #fcd34d'}}>
                      {r.status==='Dropout'?'🔴 Dropout':'🟠 Semester Back'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchResult && !searchResult.found && (
            <div style={{marginTop:20, color:'#166534', background:'#f0fdf4', border:'2px solid #86efac', borderRadius:10, padding:16}}>
              <strong>No record found for "{searchName}".</strong>
            </div>
          )}
        </div>
        <div className="card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
            <div>
              <h2>📋 Student Records Management</h2>
              <p style={{margin:'4px 0 0', color:'#666', fontSize:14}}>Add and manage student semester back records</p>
            </div>
          </div>
          
          {err && <div style={{color:'#dc2626', fontSize:13, marginBottom:16, padding:12, background:'#fee2e2', borderRadius:10, border:'1px solid #fecaca'}}><strong>⚠️ Error:</strong> {err}</div>}
          
          <form onSubmit={create} style={{maxWidth:'100%', marginBottom:32}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:16}}>
              <div className="form-row">
                <label>Student Name *</label>
                <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" required/>
              </div>
              <div className="form-row">
                <label>Current Semester *</label>
                <input className="input" value={form.current_semester} onChange={e=>setForm({...form,current_semester:e.target.value})} placeholder="e.g., 4" required/>
              </div>
              <div className="form-row">
                <label>Father Name *</label>
                <input className="input" value={form.father_name} onChange={e=>setForm({...form,father_name:e.target.value})} placeholder="Full name" required/>
              </div>
              <div className="form-row">
                <label>Father Mobile *</label>
                <input className="input" value={form.father_mobile} onChange={e=>setForm({...form,father_mobile:e.target.value})} required placeholder="10-digit mobile"/>
              </div>
              <div className="form-row">
                <label>Attendance Percentage *</label>
                <input className="input" type="number" value={form.attendance_percentage} onChange={e=>setForm({...form,attendance_percentage:e.target.value})} required min="0" max="100" placeholder="0-100"/>
              </div>
              <div className="form-row">
                <label>Reason for Semester Back *</label>
                <input className="input" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Financial, Academic, Personal..."/>
              </div>
            </div>
            <button className="btn" type="submit" style={{marginTop:16, background:'linear-gradient(135deg,#22c55e,#16a34a)'}}>➕ Add New Record</button>
          </form>
        </div>

        <div className="card">
          <h2>📊 Existing Records</h2>
          <p style={{margin:'4px 0 16px', color:'#666', fontSize:14}}>Total records: <strong>{records.length}</strong></p>
          {records.length === 0 ? (
            <div style={{textAlign:'center', padding:40, background:'linear-gradient(135deg,#f3f4f6,#e5e7eb)', borderRadius:12}}>
              <div style={{fontSize:48, marginBottom:12}}>📭</div>
              <p style={{margin:0, color:'#666', fontSize:14}}>No records yet. Add a student record above to get started.</p>
            </div>
          ) : (
            <div style={{overflowX:'auto', marginTop:20}}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Semester</th>
                    <th>Father Name</th>
                    <th>Mobile</th>
                    <th>Attendance</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r=> (
                    editing === r.id ? (
                      <tr key={r.id} style={{background:'#f0fdf4'}}>
                        <td><input className="input" style={{padding:8, fontSize:13}} value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/></td>
                        <td><input className="input" style={{padding:8, fontSize:13}} value={editForm.current_semester} onChange={e=>setEditForm({...editForm,current_semester:e.target.value})}/></td>
                        <td><input className="input" style={{padding:8, fontSize:13}} value={editForm.father_name} onChange={e=>setEditForm({...editForm,father_name:e.target.value})}/></td>
                        <td><input className="input" style={{padding:8, fontSize:13}} value={editForm.father_mobile} onChange={e=>setEditForm({...editForm,father_mobile:e.target.value})}/></td>
                        <td><input className="input" style={{padding:8, fontSize:13}} value={editForm.attendance_percentage} onChange={e=>setEditForm({...editForm,attendance_percentage:e.target.value})}/></td>
                        <td><input className="input" style={{padding:8, fontSize:13}} value={editForm.reason} onChange={e=>setEditForm({...editForm,reason:e.target.value})}/></td>
                        <td style={{whiteSpace:'nowrap'}}>
                          <button className="btn small" onClick={()=>saveEdit(r)} style={{marginRight:4}}>💾 Save</button>
                          <button className="btn small" style={{background:'#9ca3af'}} onClick={()=>setEditing(null)}>✕ Cancel</button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={r.id}>
                        <td><strong>{r.name}</strong></td>
                        <td>{r.current_semester}</td>
                        <td>{r.father_name}</td>
                        <td>{r.father_mobile}</td>
                        <td><span style={{background:'#dbeafe', color:'#0c4a6e', padding:'4px 8px', borderRadius:6, fontWeight:600}}>{r.attendance_percentage}%</span></td>
                        <td>{r.reason}</td>
                        <td style={{whiteSpace:'nowrap'}}>
                          <button className="btn small" onClick={()=>startEdit(r)} style={{marginRight:4}}>✏️ Edit</button>
                          <button className="btn small btn-danger" onClick={()=>del(r.id)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
// End of FacultyDashboard component
}

