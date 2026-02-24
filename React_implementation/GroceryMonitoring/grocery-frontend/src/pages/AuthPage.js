import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', address: '', contact: '', username: '', password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await loginUser(loginForm);
      login(res.data);
      navigate('/products');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await registerUser(registerForm);
      setSuccess('Account created! Please login.');
      setTab('login');
      setRegisterForm({ name: '', address: '', contact: '', username: '', password: '' });
    } catch {
      setError('Registration failed. Username may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🌿 FreshMart</h1>
          <p>Your daily grocery destination</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
            Login
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); setSuccess(''); }}>
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" type="text" placeholder="Enter your username" required
                value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" placeholder="Enter your password" required
                value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? '⏳ Logging in...' : '🔐 Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" type="text" placeholder="John Doe" required
                value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input className="form-control" type="text" placeholder="123 Main St, City" required
                value={registerForm.address} onChange={e => setRegisterForm({ ...registerForm, address: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input className="form-control" type="text" placeholder="+91 9999999999" required
                value={registerForm.contact} onChange={e => setRegisterForm({ ...registerForm, contact: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" type="text" placeholder="Choose a username" required
                value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" placeholder="Choose a password" required
                value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? '⏳ Creating Account...' : '✨ Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
