import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');
  const [search,  setSearch]  = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (id === me.userId) { setMsg("You can't delete your own account."); return; }
    if (!window.confirm('Delete this user? This is irreversible.')) return;
    setDeletingId(id);
    try {
      await userAPI.delete(id);
      setMsg('User deleted.');
      setTimeout(() => setMsg(''), 3000);
      await load();
    } catch { setMsg('Failed to delete user.'); }
    finally { setDeletingId(null); }
  };

  const ROLES = ['ALL', 'USER', 'SPOT_LENDER', 'ADMIN'];
  const roleColor = { USER:'var(--primary)', SPOT_LENDER:'var(--accent)', ADMIN:'var(--warning)' };

  let filtered = users;
  if (filter !== 'ALL') filtered = filtered.filter(u => u.role === filter);
  if (search) filtered = filtered.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Manage Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24, alignItems:'flex-end' }}>
        <div style={{ flex:'1', minWidth:200 }}>
          <label className="form-label">Search</label>
          <input className="form-input" placeholder="Name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {ROLES.map(r => (
            <button key={r}
              className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(r)}>
              {r === 'ALL' ? `All (${users.length})` : `${r} (${users.filter(u => u.role === r).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.userId}>
                <td style={{color:'var(--text-muted)'}}>{u.userId}</td>
                <td>
                  <span style={{fontWeight:600}}>
                    {u.name}
                    {u.userId === me.userId && (
                      <span style={{marginLeft:8,fontSize:'0.7rem',color:'var(--primary)',fontWeight:700}}>(You)</span>
                    )}
                  </span>
                </td>
                <td style={{color:'var(--text-secondary)',fontSize:'0.85rem'}}>{u.email}</td>
                <td style={{color:'var(--text-secondary)',fontSize:'0.85rem'}}>{u.phoneNo || '—'}</td>
                <td>
                  <span style={{
                    fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.05em',
                    color: roleColor[u.role] || 'var(--text-secondary)'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>
                  {u.userId !== me.userId && (
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={deletingId === u.userId}
                      onClick={() => handleDelete(u.userId)}>
                      {deletingId === u.userId ? '...' : 'Delete'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <div className="empty-title">No users found</div>
        </div>
      )}
    </div>
  );
}
