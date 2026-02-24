import React, { useState } from 'react';
import { PatientAPI, DoctorAPI } from '../services/api';

const SPECIALITIES = [
  'Cardiology','Neurology','Orthopedics','Dermatology','Pediatrics',
  'Oncology','General Medicine','Psychiatry','Radiology','Emergency Medicine',
  'Gynecology','Urology','ENT','Ophthalmology','Dentistry',
];

export default function Signup({ onSignupSuccess, onGoLogin }) {
  const [role,    setRole]    = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Patient fields
  const [pName,    setPName]    = useState('');
  const [pAge,     setPAge]     = useState('');
  const [pGender,  setPGender]  = useState('Male');
  const [pContact, setPContact] = useState('');

  // Doctor fields
  const [dName,       setDName]       = useState('');
  const [dSpeciality, setDSpeciality] = useState('');
  const [dExperience, setDExperience] = useState('');
  const [dContact,    setDContact]    = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (role === 'patient') {
        const res = await PatientAPI.create({
          pName, pAge: parseInt(pAge), pGender, pContact
        });
        const created = res.data;
        setSuccess(`Account created! Your Patient ID is: ${created.pId}. Please save this ID — you need it to login.`);
      } else {
        const res = await DoctorAPI.create({
          dName, dSpeciality, dExperience: parseInt(dExperience), dContact
        });
        const created = res.data;
        setSuccess(`Account created! Your Doctor ID is: ${created.dId}. Please save this ID — you need it to login.`);
      }
    } catch (err) {
      setError('Signup failed. Please check your details and try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🏥 MediTrack</h1>
          <p>Patient Monitoring System</p>
        </div>

        <div className="auth-title">Create Account</div>
        <div className="auth-sub">Register as a Patient or Doctor</div>

        <div className="role-tabs">
          <button className={`role-tab ${role === 'patient' ? 'active' : ''}`} onClick={() => { setRole('patient'); setError(''); setSuccess(''); }}>
            👤 Patient
          </button>
          <button className={`role-tab ${role === 'doctor' ? 'active' : ''}`} onClick={() => { setRole('doctor'); setError(''); setSuccess(''); }}>
            🩺 Doctor
          </button>
        </div>

        {error   && <div className="error-box">{error}</div>}
        {success && (
          <div className="success-box">
            {success}
            <br />
            <button style={{ marginTop: 10, background: 'none', border: 'none', color: '#16a34a', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={onGoLogin}>
              Go to Login →
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSignup}>
            {role === 'patient' ? (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name (pName)</label>
                  <input className="form-input" value={pName} onChange={e => setPName(e.target.value)} placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Age (pAge)</label>
                  <input className="form-input" type="number" value={pAge} onChange={e => setPAge(e.target.value)} placeholder="Your age" min="0" max="150" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender (pGender)</label>
                  <select className="form-select" value={pGender} onChange={e => setPGender(e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact (pContact) — used for login</label>
                  <input className="form-input" value={pContact} onChange={e => setPContact(e.target.value)} placeholder="Phone number or email" required />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name (dName)</label>
                  <input className="form-input" value={dName} onChange={e => setDName(e.target.value)} placeholder="Dr. Full Name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Speciality (dSpeciality)</label>
                  <select className="form-select" value={dSpeciality} onChange={e => setDSpeciality(e.target.value)} required>
                    <option value="">-- Select Speciality --</option>
                    {SPECIALITIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience in Years (dExperience)</label>
                  <input className="form-input" type="number" value={dExperience} onChange={e => setDExperience(e.target.value)} placeholder="e.g. 10" min="0" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact (dContact) — used for login</label>
                  <input className="form-input" value={dContact} onChange={e => setDContact(e.target.value)} placeholder="Phone number or email" required />
                </div>
              </>
            )}

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : `Create ${role === 'patient' ? 'Patient' : 'Doctor'} Account`}
            </button>
          </form>
        )}

        <div className="auth-switch">
          Already have an account?{' '}
          <button onClick={onGoLogin}>Login here</button>
        </div>
      </div>
    </div>
  );
}
