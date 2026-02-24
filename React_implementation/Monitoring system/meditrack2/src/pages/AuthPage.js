import React, { useState } from 'react';
import { PatientAPI, DoctorAPI } from '../services/api';

const SPECIALITIES = ['Cardiology','Neurology','Orthopedics','Dermatology','Pediatrics','Oncology','General Medicine','Psychiatry','Radiology','Emergency Medicine'];

export default function AuthPage({ onLogin }) {
  const [tab,        setTab]       = useState('login');
  const [role,       setRole]      = useState('patient');
  const [error,      setError]     = useState('');
  const [success,    setSuccess]   = useState('');
  const [loading,    setLoading]   = useState(false);
  const [loginInput, setLoginInput]= useState('');

  // Single form state object for signup — no unused vars
  const [sf, setSf] = useState({
    pName:'', pAge:'', pGender:'Male', pContact:'',
    dName:'', dSpeciality:'', dExperience:'', dContact:''
  });
  const setF = e => setSf(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const switchTab  = t => { setTab(t);  setError(''); setSuccess(''); setLoginInput(''); };
  const switchRole = r => { setRole(r); setError(''); setSuccess(''); };

  // ── LOGIN ─────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const input = loginInput.trim();
    if (!input) { setError('Please enter your Name or ID.'); setLoading(false); return; }

    try {
      if (role === 'patient') {
        const allRes = await PatientAPI.getAll();
        const all    = Array.isArray(allRes.data) ? allRes.data : [];
        let found    = null;
        if (!isNaN(input)) found = all.find(p => p.pId === parseInt(input));
        if (!found)         found = all.find(p => p.pName?.toLowerCase() === input.toLowerCase());
        if (found) {
          onLogin({ role: 'patient', id: found.pId, name: found.pName, data: found });
        } else {
          setError(`No patient found with name or ID "${input}". Please sign up first.`);
        }
      } else {
        const allRes = await DoctorAPI.getAll();
        const all    = Array.isArray(allRes.data) ? allRes.data : [];
        let found    = null;
        if (!isNaN(input)) found = all.find(d => d.dId === parseInt(input));
        if (!found)         found = all.find(d => d.dName?.toLowerCase() === input.toLowerCase());
        if (found) {
          onLogin({ role: 'doctor', id: found.dId, name: found.dName, data: found });
        } else {
          setError(`No doctor found with name or ID "${input}". Please sign up first.`);
        }
      }
    } catch {
      setError('Cannot connect to backend. Make sure Spring Boot is running on port 8080.');
    }
    setLoading(false);
  };

  // ── SIGNUP ────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (role === 'patient') {
        const res = await PatientAPI.create({ pName: sf.pName, pAge: parseInt(sf.pAge), pGender: sf.pGender, pContact: sf.pContact });
        const p = res.data;
        setSuccess(`✅ Registered! Your Patient ID is #${p.pId} and name is "${p.pName}". Use either to login.`);
        setSf(prev => ({ ...prev, pName:'', pAge:'', pGender:'Male', pContact:'' }));
      } else {
        const res = await DoctorAPI.create({ dName: sf.dName, dSpeciality: sf.dSpeciality, dExperience: parseInt(sf.dExperience), dContact: sf.dContact });
        const d = res.data;
        setSuccess(`✅ Registered! Your Doctor ID is #${d.dId} and name is "${d.dName}". Use either to login.`);
        setSf(prev => ({ ...prev, dName:'', dSpeciality:'', dExperience:'', dContact:'' }));
      }
    } catch {
      setError('Registration failed. Please check your details and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🏥 MediTrack</h1>
          <p>Patient Monitoring System</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login'  ? 'active' : ''}`} onClick={() => switchTab('login')}>Login</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => switchTab('signup')}>Sign Up</button>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          <button type="button" className={`role-btn ${role === 'patient' ? 'selected' : ''}`} onClick={() => switchRole('patient')}>
            <span className="role-icon">👤</span>
            <div className="role-label">Patient</div>
            <div className="role-sub">Access your health records</div>
          </button>
          <button type="button" className={`role-btn ${role === 'doctor' ? 'selected' : ''}`} onClick={() => switchRole('doctor')}>
            <span className="role-icon">🩺</span>
            <div className="role-label">Doctor</div>
            <div className="role-sub">Manage consultations</div>
          </button>
        </div>

        {error   && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">
                {role === 'patient' ? 'Your Name or Patient ID' : 'Your Name or Doctor ID'}
              </label>
              <input
                className="form-input"
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
                placeholder={role === 'patient' ? 'e.g. Sena  or  1' : 'e.g. Dr. Smith  or  3'}
                required
              />
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                💡 Enter your <strong>registered name</strong> or your <strong>ID number</strong>.
              </p>
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : `Login as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
            </button>
          </form>
        )}

        {/* SIGNUP - PATIENT */}
        {tab === 'signup' && role === 'patient' && (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Full Name (pName)</label>
              <input className="form-input" name="pName" value={sf.pName} onChange={setF} placeholder="Your full name" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age (pAge)</label>
                <input className="form-input" name="pAge" type="number" value={sf.pAge} onChange={setF} placeholder="Age" min="0" max="150" required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender (pGender)</label>
                <select className="form-select" name="pGender" value={sf.pGender} onChange={setF}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact (pContact)</label>
              <input className="form-input" name="pContact" value={sf.pContact} onChange={setF} placeholder="Phone or email" required />
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register as Patient'}
            </button>
          </form>
        )}

        {/* SIGNUP - DOCTOR */}
        {tab === 'signup' && role === 'doctor' && (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Full Name (dName)</label>
              <input className="form-input" name="dName" value={sf.dName} onChange={setF} placeholder="Dr. Full Name" required />
            </div>
            <div className="form-group">
              <label className="form-label">Speciality (dSpeciality)</label>
              <select className="form-select" name="dSpeciality" value={sf.dSpeciality} onChange={setF} required>
                <option value="">-- Select Speciality --</option>
                {SPECIALITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Experience (Years)</label>
                <input className="form-input" name="dExperience" type="number" value={sf.dExperience} onChange={setF} placeholder="e.g. 10" min="0" required />
              </div>
              <div className="form-group">
                <label className="form-label">Contact (dContact)</label>
                <input className="form-input" name="dContact" value={sf.dContact} onChange={setF} placeholder="Phone or email" required />
              </div>
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register as Doctor'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          {tab === 'login'
            ? <>New here? <button onClick={() => switchTab('signup')}>Create an account</button></>
            : <>Already registered? <button onClick={() => switchTab('login')}>Login</button></>
          }
        </div>
      </div>
    </div>
  );
}
