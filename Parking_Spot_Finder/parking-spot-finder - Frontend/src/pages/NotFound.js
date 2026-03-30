import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:24, textAlign:'center' }}>
      <div style={{ fontSize:'5rem', fontFamily:'var(--font-display)', fontWeight:900, color:'var(--primary)', lineHeight:1 }}>
        404
      </div>
      <h2 style={{ color:'var(--text-secondary)' }}>Page not found</h2>
      <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', maxWidth:320 }}>
        The page you're looking for doesn't exist or you don't have access to it.
      </p>
      <Link to={user ? '/dashboard' : '/search'} className="btn btn-primary" style={{ marginTop:8 }}>
        ← Go back home
      </Link>
    </div>
  );
}
