import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile(){
  const nav = useNavigate()
  const name = localStorage.getItem('name') || localStorage.getItem('email')
  const role = localStorage.getItem('role')

  function goUpload(){ nav('/upload') }

  return (
    <div className="card" style={{maxWidth:720}}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Role:</strong> {role}</p>
      <div style={{display:'flex',gap:12}}>
        <button className="btn" onClick={goUpload}>Upload Dataset</button>
        {role === 'university' || role === 'admin' ? (
          <Link to="/admin/records" className="btn">Manage Records</Link>
        ) : null}
        <Link to="/student-check" className="btn" style={{background:'#fff',color:'#333'}}>Student Check</Link>
        <button className="btn" onClick={()=>{localStorage.removeItem('token'); localStorage.removeItem('email'); localStorage.removeItem('name'); nav('/')}}>Sign Out</button>
      </div>
    </div>
  )
}
