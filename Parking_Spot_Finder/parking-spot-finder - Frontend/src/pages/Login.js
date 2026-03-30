import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        // Network / CORS error — backend unreachable
        setError(
          'Cannot reach the server. Please ensure:\n' +
          '① Spring Boot is running on http://localhost:8080\n' +
          '② CORS is configured on the backend'
        );
      } else {
        const msg = err.response?.data?.message
          || (typeof err.response?.data === 'string' ? err.response.data : null)
          || `Error ${err.response.status}: ${err.response.statusText}`;
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />

      <div className="auth-card page-enter">
        <div className="auth-logo">
          <span>🅿</span>
          <h1>Park<span>Ease</span></h1>
        </div>
        <p className="auth-tagline">Smart parking, simplified.</p>

        <h2 className="auth-title">Welcome back</h2>

        {error && (
          <div className="alert alert-error" style={{ whiteSpace: 'pre-line' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email" type="email" required
              className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password" type="password" required
              className="form-input" placeholder="••••••••"
              value={form.password} onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading
              ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
              : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>

        <div className="auth-divider"><span>or continue as</span></div>
        <Link to="/search" className="btn btn-secondary btn-full">
          🔍 Browse Parking as Guest
        </Link>
      </div>
    </div>
  );
}
