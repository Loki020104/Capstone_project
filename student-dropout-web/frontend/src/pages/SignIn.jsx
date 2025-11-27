import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SignIn(){
  const [email,setEmail] = useState('')
  const [name, setName] = useState('')
  const [password,setPassword] = useState('')
  const [err,setErr] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setErr('')
    try{
      const res = await fetch('http://127.0.0.1:5002/api/signin', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email,password})
      })
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'signin failed')
      else{
        localStorage.setItem('token', j.token)
        localStorage.setItem('email', j.email)
        localStorage.setItem('name', name)
        localStorage.setItem('role', j.role)
        navigate('/profile')
      }
    }catch(e){ setErr(String(e)) }
  }

  return (
    <div className="card" style={{maxWidth:420}}>
      <h2>Sign In</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <label>Your Name</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {err && <div style={{color:'red'}}>{err}</div>}
        <button className="btn" type="submit">Sign In</button>
      </form>
    </div>
  )
}
