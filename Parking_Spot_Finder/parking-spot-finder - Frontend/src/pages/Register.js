import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const ROLES = [
  { value: 'USER',        label: 'User — Book parking spots' },
  { value: 'SPOT_LENDER', label: 'Spot Lender — List my parking space' },
  { value: 'ADMIN',       label: 'Admin — Manage the platform' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phoneNo: '', role: 'USER' });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />

      <div className="auth-card auth-card-wide page-enter">
        <div className="auth-logo">
          <span>🅿</span>
          <h1>Park<span>Ease</span></h1>
        </div>

        <h2 className="auth-title">Create your account</h2>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" required className="form-input" placeholder="John Doe"
                value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input name="phoneNo" className="form-input" placeholder="+91 98765 43210"
                value={form.phoneNo} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input name="email" type="email" required className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" required className="form-input" placeholder="••••••••"
                value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input name="confirmPassword" type="password" required className="form-input" placeholder="••••••••"
                value={form.confirmPassword} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">I want to register as</label>
            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:18,height:18,borderWidth:2}} /> Creating...</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
