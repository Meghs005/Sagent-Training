import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [role, setRole] = useState('student');
  const [mode, setMode] = useState('login'); // login | register
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', name: '', contact: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        const userData = {
          username: form.username,
          password: form.password,
          name: form.name,
          contact: form.contact ? Number(form.contact) : null,
          role: role.toUpperCase(),
        };
        const res = await userAPI.create(userData);
        addToast('Account created! Please log in.', 'success');
        setMode('login');
        setForm(f => ({ ...f, name: '', contact: '' }));
      } else {
        // Fetch all users and match
        const res = await userAPI.getAll();
        const users = res.data;
        const matched = users.find(
          u => u.username === form.username && u.password === form.password &&
          (u.role || '').toUpperCase() === role.toUpperCase()
        );
        if (!matched) {
          addToast('Invalid credentials or role mismatch.', 'error');
          setLoading(false);
          return;
        }
        login(matched);
        addToast(`Welcome back, ${matched.name || matched.username}!`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Something went wrong.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content fade-in">
          <h1>Your <span>Library,</span> Reimagined.</h1>
          <p style={{ marginBottom: '2rem' }}>
            A modern portal for discovering, issuing, and managing books across your institution — 
            elegant, intuitive, and built for the 21st century reader.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', opacity: 0.5 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: '2rem', color: 'white' }}>∞</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Books</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: '2rem', color: 'white' }}>⚡</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Fast Issuing</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Serif Display', fontSize: '2rem', color: 'white' }}>◎</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Notifications</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box fade-in">
          <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          <p className="sub">Access the {role === 'librarian' ? 'Librarian' : 'Student'} Portal</p>

          <div className="role-toggle">
            <button className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>
              Student
            </button>
            <button className={role === 'librarian' ? 'active' : ''} onClick={() => setRole('librarian')}>
              Librarian
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    className="input-field" placeholder="Your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input name="contact" value={form.contact} onChange={handleChange}
                    className="input-field" placeholder="10-digit number" type="number" />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Username</label>
              <input name="username" value={form.username} onChange={handleChange}
                className="input-field" placeholder="your_username" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" value={form.password} onChange={handleChange}
                className="input-field" placeholder="••••••••" type="password" required />
            </div>

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}
              style={{ marginTop: '0.5rem' }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--slate)' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => setMode('register')}
                  style={{ background: 'none', border: 'none', color: 'var(--amber)', fontWeight: 600, cursor: 'pointer' }}>
                  Register
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--amber)', fontWeight: 600, cursor: 'pointer' }}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
