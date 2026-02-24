import React, { useState } from 'react';
import { PatientAPI, DoctorAPI } from '../services/api';

export default function Login({ onLogin, onGoSignup }) {
  const [role,     setRole]     = useState('patient');
  const [idVal,    setIdVal]    = useState('');
  const [contact,  setContact]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'patient') {
        // Fetch patient by ID then verify contact
        const res = await PatientAPI.getById(idVal);
        const patient = res.data;
        if (patient && patient.pContact === contact) {
          onLogin({ role: 'patient', name: patient.pName, id: patient.pId, data: patient });
        } else {
          setError('Invalid Patient ID or contact. Please check and try again.');
        }
      } else {
        // Fetch doctor by ID then verify contact
        const res = await DoctorAPI.getById(idVal);
        const doctor = res.data;
        if (doctor && doctor.dContact === contact) {
          onLogin({ role: 'doctor', name: doctor.dName, id: doctor.dId, data: doctor });
        } else {
          setError('Invalid Doctor ID or contact. Please check and try again.');
        }
      }
    } catch (err) {
      setError('Account not found. Please signup first or check your details.');
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

        <div className="auth-title">Welcome Back</div>
        <div className="auth-sub">Login to your account</div>

        {/* Role Selector */}
        <div className="role-tabs">
          <button className={`role-tab ${role === 'patient' ? 'active' : ''}`} onClick={() => { setRole('patient'); setError(''); }}>
            👤 Patient
          </button>
          <button className={`role-tab ${role === 'doctor' ? 'active' : ''}`} onClick={() => { setRole('doctor'); setError(''); }}>
            🩺 Doctor
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">
              {role === 'patient' ? 'Patient ID (pId)' : 'Doctor ID (dId)'}
            </label>
            <input
              className="form-input"
              type="number"
              value={idVal}
              onChange={e => setIdVal(e.target.value)}
              placeholder={role === 'patient' ? 'Enter your Patient ID' : 'Enter your Doctor ID'}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              {role === 'patient' ? 'Contact (pContact)' : 'Contact (dContact)'}
            </label>
            <input
              className="form-input"
              type="text"
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="Enter your registered contact"
              required
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : `Login as ${role === 'patient' ? 'Patient' : 'Doctor'}`}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{' '}
          <button onClick={onGoSignup}>Sign up here</button>
        </div>
      </div>
    </div>
  );
}
