import React, {useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function StudentSignUp(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [err,setErr] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setErr('')
    if(!email || !password) return setErr('Email and password required')
    if(password.length < 6) return setErr('Password must be at least 6 characters')
    try{
  const res = await fetch('http://127.0.0.1:5002/api/signup', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email, password, role: 'student'})
      })
      const j = await res.json()
      if(!j.ok) setErr(j.error || 'Signup failed')
      else {
        alert('✅ Account created! Please sign in.')
        navigate('/student-signin')
      }
    }catch(e){ setErr('Network error: ' + String(e)) }
  }

  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh', padding:'40px 20px'}}>
      <div className="card" style={{maxWidth:500}}>
        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{fontSize:56, marginBottom:12, display:'inline-block', background:'linear-gradient(135deg,#14b8a6,#06b6d4)', webkitBackgroundClip:'text', webkitTextFillColor:'transparent', backgroundClip:'text'}}>👨‍🎓</div>
          <h2 style={{margin:'0 0 8px', fontSize:28}}>Student Registration</h2>
          <p style={{margin:0, fontSize:14, color:'#666'}}>Create your account to check your status</p>
        </div>

        <form onSubmit={submit}>
          <div className="form-row">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters" required />
          </div>

          {err && <div style={{color:'#dc2626', fontSize:13, marginBottom:16, padding:12, background:'#fee2e2', borderRadius:10, border:'1px solid #fecaca'}}><strong>⚠️</strong> {err}</div>}

          <button className="btn" type="submit" style={{width:'100%', background:'linear-gradient(135deg,#14b8a6,#06b6d4)', fontSize:15, padding:14}}>Create Account</button>
        </form>

        <div style={{marginTop:20, paddingTop:20, borderTop:'1px solid #e5e7eb', textAlign:'center'}}>
          <p style={{margin:'0 0 12px', fontSize:14, color:'#666'}}>Already have an account?</p>
          <Link to="/student-signin" style={{display:'inline-block', color:'white', background:'linear-gradient(135deg,#14b8a6,#06b6d4)', padding:'10px 24px', borderRadius:8, textDecoration:'none', fontWeight:600, fontSize:14}}>Sign In Here</Link>
        </div>

        <div style={{marginTop:20, padding:16, background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)', borderRadius:10, border:'1px solid #99f6e4'}}>
          <p style={{margin:0, fontSize:12, color:'#0d6e6e', fontWeight:500}}>✨ Once registered, you can check your academic status anytime</p>
        </div>
      </div>
    </div>
  )
}
