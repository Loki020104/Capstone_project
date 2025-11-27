import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SignUp(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [role,setRole] = useState('student')
  const [err,setErr] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setErr('')
    try{
      const res = await fetch('http://127.0.0.1:5002/api/signup', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email,password,role})
      })
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'signup failed')
      else navigate('/signin')
    }catch(e){ setErr(String(e)) }
  }

  return (
    <div className="card" style={{maxWidth:420}}>
      <h2>Sign Up</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <label>Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Role</label>
          <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="university">University (upload)</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {err && <div style={{color:'red'}}>{err}</div>}
        <button className="btn" type="submit">Create account</button>
      </form>
    </div>
  )
}
