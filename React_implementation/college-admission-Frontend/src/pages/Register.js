import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', username: '', password: '', age: '', role: 'STUDENT' });
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
      const res = await userAPI.create({ ...form, age: parseInt(form.age) });
      login(res.data);
      navigate(res.data.role === 'OFFICER' ? '/officer' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <h2 className="auth-tagline">Begin your academic journey today.</h2>
        <p className="auth-sub">Create an account to apply for admission, track your progress, and manage your documents — all in one place.</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-hint">Already have an account? <Link to="/login">Sign in</Link></p>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Username</label>
                <input name="username" value={form.username} onChange={handleChange} required placeholder="johndoe" />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input name="age" type="number" value={form.age} onChange={handleChange} required placeholder="18" min="16" max="60" />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="STUDENT">Student</option>
                <option value="OFFICER">Admission Officer</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
