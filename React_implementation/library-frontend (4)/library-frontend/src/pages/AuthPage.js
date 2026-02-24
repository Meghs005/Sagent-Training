import React, { useState } from 'react';
import { userApi } from '../api/api';
import './AuthPage.css';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('MEMBER'); // 'LIBRARIAN' | 'MEMBER'
  const [form, setForm] = useState({ username: '', password: '', name: '', contact: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (r) => setRole(r);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const payload = {
          username: form.username,
          password: form.password,
          name: form.name,
          contact: form.contact ? Number(form.contact) : null,
          role: role,
        };
        const res = await userApi.create(payload);
        onLogin(res.data);
      } else {
        // Login: fetch all users and match credentials
        const res = await userApi.getAll();
        const matched = res.data.find(
          u => u.username === form.username && u.password === form.password
        );
        if (!matched) throw new Error('Invalid username or password');
        onLogin(matched);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const f = (field, val) => setForm(p => ({ ...p, [field]: val }));

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-brand-icon">📚</span>
          <span className="auth-brand-name">LibrariumOS</span>
        </div>
        <div className="auth-tagline">
          <div className="auth-big-text">The smarter<br />way to manage<br />your library.</div>
          <div className="auth-sub-text">Track books, issues, fines, and notifications — all in one place.</div>
        </div>
        <div className="auth-deco">
          <div className="deco-circle c1" />
          <div className="deco-circle c2" />
          <div className="deco-circle c3" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>Sign Up</button>
          </div>

          <div className="auth-role-section">
            <div className="auth-role-label">I am a</div>
            <div className="auth-role-cards">
              <button
                type="button"
                className={`role-card ${role === 'LIBRARIAN' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('LIBRARIAN')}
              >
                <div className="role-icon">🧑‍💼</div>
                <div className="role-name">Librarian</div>
                <div className="role-desc">Manage books & issues</div>
                {role === 'LIBRARIAN' && <div className="role-check">✓</div>}
              </button>
              <button
                type="button"
                className={`role-card ${role === 'MEMBER' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('MEMBER')}
              >
                <div className="role-icon">🎓</div>
                <div className="role-name">Student</div>
                <div className="role-desc">Borrow & track books</div>
                {role === 'MEMBER' && <div className="role-check">✓</div>}
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => f('name', e.target.value)}
                />
              </div>
            )}
            <div className="auth-field">
              <label>Username</label>
              <input
                required
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => f('username', e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => f('password', e.target.value)}
              />
            </div>
            {mode === 'signup' && (
              <div className="auth-field">
                <label>Contact Number</label>
                <input
                  type="number"
                  placeholder="9876543210"
                  value={form.contact}
                  onChange={e => f('contact', e.target.value)}
                />
              </div>
            )}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? `Sign In as ${role === 'LIBRARIAN' ? 'Librarian' : 'Student'}` : `Create Account`}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? (
              <span>Don't have an account? <button onClick={() => { setMode('signup'); setError(''); }}>Sign Up</button></span>
            ) : (
              <span>Already have an account? <button onClick={() => { setMode('login'); setError(''); }}>Sign In</button></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
