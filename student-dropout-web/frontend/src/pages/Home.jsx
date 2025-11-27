import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div style={{background:'linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)', minHeight:'100vh'}}>
      {/* Navigation Bar */}
      <nav style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 40px', background:'white', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', position:'sticky', top:0, zIndex:999}}>
        <div style={{fontSize:24, fontWeight:900, background:'linear-gradient(135deg,#0ea5e9,#06b6d4)', webkitBackgroundClip:'text', webkitTextFillColor:'transparent', backgroundClip:'text'}}>
          🎓 STUDENT DROPOUT ANALYSIS
        </div>
        <div style={{display:'flex', gap:16, alignItems:'center'}}>
          <Link to="/university-signin" style={{color:'#64748b', textDecoration:'none', fontWeight:600, fontSize:14, transition:'all 0.3s'}}>Sign In</Link>
          <Link to="/university-signup" className="btn" style={{background:'linear-gradient(135deg,#0ea5e9,#06b6d4)', padding:'10px 20px', fontSize:13, fontWeight:700}}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{paddingTop:60, paddingBottom:80, textAlign:'center', maxWidth:900, margin:'0 auto', padding:'60px 20px'}}>
        {/* Pill Badge */}
        <div style={{display:'inline-block', background:'linear-gradient(135deg,#e0f2fe,#cffafe)', padding:'10px 20px', borderRadius:24, marginBottom:24, border:'1px solid #a5f3fc', color:'#0369a1', fontWeight:600, fontSize:13}}>
          ✨ AI-Powered Risk Detection
        </div>

        {/* Main Headline */}
        <h1 style={{fontSize:56, fontWeight:900, margin:'0 0 20px', lineHeight:1.2, color:'#0f172a'}}>
          Predict & Prevent
          <br/>
          <span style={{background:'linear-gradient(90deg,#0ea5e9,#06b6d4)', webkitBackgroundClip:'text', webkitTextFillColor:'transparent', backgroundClip:'text'}}>Student Dropout Risk</span>
        </h1>

        {/* Subtitle */}
        <p style={{fontSize:18, color:'#64748b', margin:'0 0 40px', lineHeight:1.7, fontWeight:400}}>
          Connect institutions with advanced analytics to identify at-risk students, track academic progress, and enable timely interventions using intelligent data insights.
        </p>

        {/* CTA Buttons */}
        <div style={{display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', marginBottom:60}}>
          <Link to="/student-signup" style={{display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#0ea5e9,#06b6d4)', color:'white', padding:'14px 32px', borderRadius:8, textDecoration:'none', fontWeight:700, fontSize:15, transition:'all 0.3s', boxShadow:'0 8px 24px rgba(6,182,212,0.3)'}}>
            👨‍🎓 I'm a Student
            <span style={{fontSize:16}}>→</span>
          </Link>
          <Link to="/university-signup" style={{display:'inline-flex', alignItems:'center', gap:8, background:'white', color:'#0f172a', padding:'14px 32px', borderRadius:8, textDecoration:'none', fontWeight:700, fontSize:15, transition:'all 0.3s', border:'2px solid #e2e8f0', boxShadow:'0 4px 12px rgba(0,0,0,0.04)'}}>
            🏫 I'm from University
          </Link>
        </div>

        {/* Info Box */}
        <div style={{background:'white', padding:24, borderRadius:12, border:'1px solid #e2e8f0', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', marginBottom:60}}>
          <p style={{margin:0, color:'#64748b', fontSize:14, fontWeight:500}}>✓ No credit card required • ✓ Start analyzing in minutes • ✓ 100% confidential</p>
        </div>

        {/* Stats Section */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:24, marginTop:60}}>
          <div>
            <div style={{fontSize:36, fontWeight:900, color:'#0ea5e9', marginBottom:8}}>1000+</div>
            <p style={{margin:0, color:'#64748b', fontSize:14, fontWeight:500}}>Students Analyzed</p>
          </div>
          <div>
            <div style={{fontSize:36, fontWeight:900, color:'#06b6d4', marginBottom:8}}>95%</div>
            <p style={{margin:0, color:'#64748b', fontSize:14, fontWeight:500}}>Accuracy Rate</p>
          </div>
          <div>
            <div style={{fontSize:36, fontWeight:900, color:'#0891b2', marginBottom:8}}>50+</div>
            <p style={{margin:0, color:'#64748b', fontSize:14, fontWeight:500}}>Universities</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{background:'white', paddingTop:80, paddingBottom:80}}>
        <div style={{maxWidth:1200, margin:'0 auto', padding:'0 20px'}}>
          <h2 style={{fontSize:40, fontWeight:900, textAlign:'center', marginBottom:60, color:'#0f172a'}}>
            Powered by Advanced Analytics
          </h2>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:32}}>
            {/* Feature 1 */}
            <div className="card" style={{textAlign:'center', border:'none'}}>
              <div style={{fontSize:48, marginBottom:16}}>📊</div>
              <h3 style={{fontSize:20, fontWeight:700, marginBottom:12, color:'#0f172a'}}>Intelligent Analytics</h3>
              <p style={{color:'#64748b', fontSize:14, lineHeight:1.6}}>Advanced machine learning algorithms analyze attendance, grades, and behavioral patterns to predict dropout risk with 95% accuracy.</p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{textAlign:'center', border:'none'}}>
              <div style={{fontSize:48, marginBottom:16}}>🎯</div>
              <h3 style={{fontSize:20, fontWeight:700, marginBottom:12, color:'#0f172a'}}>Real-time Tracking</h3>
              <p style={{color:'#64748b', fontSize:14, lineHeight:1.6}}>Monitor student progress in real-time with comprehensive dashboards showing attendance percentages and academic performance metrics.</p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{textAlign:'center', border:'none'}}>
              <div style={{fontSize:48, marginBottom:16}}>🔒</div>
              <h3 style={{fontSize:20, fontWeight:700, marginBottom:12, color:'#0f172a'}}>Secure & Compliant</h3>
              <p style={{color:'#64748b', fontSize:14, lineHeight:1.6}}>Enterprise-grade security with role-based access control, encrypted data storage, and full audit trails for complete privacy protection.</p>
            </div>

            {/* Feature 4 */}
            <div className="card" style={{textAlign:'center', border:'none'}}>
              <div style={{fontSize:48, marginBottom:16}}>⚡</div>
              <h3 style={{fontSize:20, fontWeight:700, marginBottom:12, color:'#0f172a'}}>Quick Setup</h3>
              <p style={{color:'#64748b', fontSize:14, lineHeight:1.6}}>Upload student data in CSV format and start analyzing within minutes. No complex setup or technical knowledge required.</p>
            </div>

            {/* Feature 5 */}
            <div className="card" style={{textAlign:'center', border:'none'}}>
              <div style={{fontSize:48, marginBottom:16}}>📈</div>
              <h3 style={{fontSize:20, fontWeight:700, marginBottom:12, color:'#0f172a'}}>Data Insights</h3>
              <p style={{color:'#64748b', fontSize:14, lineHeight:1.6}}>Generate comprehensive reports with visualizations to understand dropout patterns and identify intervention opportunities.</p>
            </div>

            {/* Feature 6 */}
            <div className="card" style={{textAlign:'center', border:'none'}}>
              <div style={{fontSize:48, marginBottom:16}}>👥</div>
              <h3 style={{fontSize:20, fontWeight:700, marginBottom:12, color:'#0f172a'}}>Multi-role Access</h3>
              <p style={{color:'#64748b', fontSize:14, lineHeight:1.6}}>Separate portals for universities to manage records and students to check their status anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{background:'linear-gradient(135deg,#0ea5e9 0%,#06b6d4 100%)', padding:'80px 20px', textAlign:'center', color:'white'}}>
        <h2 style={{fontSize:40, fontWeight:900, marginBottom:20}}>Ready to Transform Student Success?</h2>
        <p style={{fontSize:18, marginBottom:40, opacity:0.95}}>Start your free trial today. No credit card required.</p>
        <Link to="/university-signup" style={{display:'inline-block', background:'white', color:'#0ea5e9', padding:'14px 40px', borderRadius:8, textDecoration:'none', fontWeight:700, fontSize:15, transition:'all 0.3s', boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}>
          Get Started Now
        </Link>
      </div>

      {/* Footer */}
      <footer style={{background:'#0f172a', color:'#94a3b8', padding:'40px 20px', textAlign:'center', fontSize:13}}>
        <p style={{margin:'0 0 12px'}}>© 2025 Student Dropout Analysis. All rights reserved.</p>
        <p style={{margin:0, opacity:0.7}}>Demo application for educational purposes</p>
      </footer>
    </div>
  )
}
