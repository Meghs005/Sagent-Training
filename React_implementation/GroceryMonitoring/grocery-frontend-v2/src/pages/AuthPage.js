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
  const [regForm, setRegForm] = useState({ name: '', address: '', contact: '', username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await loginUser(loginForm);
      login(res.data);
      navigate('/products');
    } catch { setError('Invalid username or password. Please check and try again.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      await registerUser(regForm);
      setSuccess('Account created successfully! Please login.');
      setTab('login');
      setRegForm({ name: '', address: '', contact: '', username: '', password: '' });
    } catch { setError('Registration failed. Username may already be taken.'); }
    finally { setLoading(false); }
  };

  const switchTab = (t) => { setTab(t); setError(''); setSuccess(''); };

  return (
    <div className="auth-page">
      {/* LEFT SIDE */}
      <div className="auth-side">
        <div className="auth-side-content">
          <div className="auth-side-logo">Fresh<span>Mart</span></div>
          <div className="auth-side-tagline">Your daily grocery destination</div>

          {[
            { icon: '🥦', title: 'Fresh Every Day', desc: 'Sourced daily from local farms' },
            { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered to your door in hours' },
            { icon: '💳', title: 'Easy Payments', desc: 'Card, UPI, Wallet or Cash' },
            { icon: '🎁', title: 'Exclusive Offers', desc: 'Discounts just for our members' },
          ].map(f => (
            <div key={f.title} className="auth-feature">
              <span className="auth-feature-icon">{f.icon}</span>
              <div className="auth-feature-text">
                <strong>{f.title}</strong>{f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-form-side">
        <div className="auth-form-card">
          <h1 className="auth-form-title">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="auth-form-sub">
            {tab === 'login' ? 'Sign in to continue shopping' : 'Join FreshMart today'}
          </p>

          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>Login</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Register</button>
          </div>

          {error   && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-control" type="text" placeholder="Enter your username" required
                  value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" placeholder="Enter your password" required
                  value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? '⏳ Signing in...' : '→ Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" placeholder="John Doe" required
                  value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" placeholder="123 Main St, City" required
                  value={regForm.address} onChange={e => setRegForm({ ...regForm, address: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact</label>
                <input className="form-control" placeholder="+91 9999999999" required
                  value={regForm.contact} onChange={e => setRegForm({ ...regForm, contact: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-control" placeholder="Choose a username" required
                  value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" placeholder="Choose a password" required
                  value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? '⏳ Creating...' : '✨ Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
