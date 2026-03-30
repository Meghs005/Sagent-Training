import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/** Try to decode a JWT and return its payload, or null if it's not a valid JWT */
function parseJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch { return null; }
}

/** Resolve user object after a successful login response */
async function resolveUser(responseData, email) {
  const jwt      = typeof responseData === 'string' ? responseData : null;
  const claims   = jwt ? parseJwt(jwt) : null;

  // --- Strategy 1: backend returned a JWT with userId claim ---
  if (claims?.userId) {
    try {
      const userRes = await api.get(`/users/${claims.userId}`);
      return { token: jwt, user: userRes.data };
    } catch { /* fall through */ }
  }

  // --- Strategy 2: JWT has sub/email claim, look up by fetching all users ---
  const claimEmail = claims?.sub || claims?.email || email;
  if (claimEmail) {
    try {
      const usersRes = await api.get('/users');
      const found    = (usersRes.data || []).find(u => u.email === claimEmail);
      if (found) return { token: jwt || 'session', user: found };
    } catch { /* fall through */ }
  }

  // --- Strategy 3: backend returned a User object directly (some backends do this) ---
  if (responseData && typeof responseData === 'object' && responseData.email) {
    return { token: 'session', user: responseData };
  }

  // --- Strategy 4: bare fallback from JWT claims only ---
  if (claims) {
    return {
      token: jwt,
      user: {
        userId: claims.userId || claims.id || null,
        email:  claims.sub || claims.email || email,
        role:   claims.role || claims.roles?.[0] || 'USER',
        name:   claims.name || email,
      }
    };
  }

  // Nothing worked — re-throw so the UI shows a meaningful error
  throw new Error('Login succeeded but could not resolve user details. Check backend response.');
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  /* Restore session from localStorage */
  useEffect(() => {
    const storedToken = localStorage.getItem('psf_token');
    const storedUser  = localStorage.getItem('psf_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedToken !== 'session') {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    const { token: tok, user: userData } = await resolveUser(res.data, email);

    if (tok && tok !== 'session') {
      api.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    }
    setToken(tok);
    setUser(userData);
    localStorage.setItem('psf_token', tok || 'session');
    localStorage.setItem('psf_user', JSON.stringify(userData));
    return userData;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await api.post('/users', formData);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('psf_token');
    localStorage.removeItem('psf_user');
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
    localStorage.setItem('psf_user', JSON.stringify(updated));
  }, []);

  const value = { user, token, loading, login, register, logout, updateUser,
    isGuest:   !user,
    isUser:    user?.role === 'USER',
    isLender:  user?.role === 'SPOT_LENDER',
    isAdmin:   user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
