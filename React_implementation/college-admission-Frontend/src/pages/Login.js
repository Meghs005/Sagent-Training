import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Fetch all users and find matching credentials
      const res = await userAPI.getAll();
      const user = res.data.find(
        (u) => u.username === form.username && u.password === form.password
      );
      if (!user) throw new Error('Invalid username or password.');
      login(user);
      navigate(user.role === 'OFFICER' ? '/officer' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-serif">Edu</span><span className="brand-accent">Admit</span>
        </div>
        <h2 className="auth-tagline">Welcome back.</h2>
        <p className="auth-sub">Sign in to continue your application or review submitted applications as an officer.</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-hint">Don't have an account? <Link to="/register">Register</Link></p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input name="username" value={form.username} onChange={handleChange} required placeholder="johndoe" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
