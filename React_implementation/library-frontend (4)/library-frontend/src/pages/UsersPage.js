import React, { useEffect, useState } from 'react';
import { userApi } from '../api/api';

const emptyUser = { username: '', password: '', name: '', role: 'MEMBER', contact: '' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    userApi.getAll().then(r => setUsers(r.data)).catch(() => setError('Failed to load users')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyUser); setModal(true); setError(''); };
  const openEdit = (u) => { setEditing(u.userId); setForm({ username: u.username, password: u.password, name: u.name, role: u.role, contact: u.contact || '' }); setModal(true); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, contact: form.contact ? Number(form.contact) : null };
      if (editing) await userApi.update(editing, payload);
      else await userApi.create(payload);
      setModal(false); load();
    } catch { setError('Failed to save user'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await userApi.delete(id); load(); } catch { setError('Failed to delete'); }
  };

  const roleBadge = (r) => {
    const map = { ADMIN: 'badge-admin', LIBRARIAN: 'badge-librarian', MEMBER: 'badge-member' };
    return <span className={`badge ${map[r] || 'badge-member'}`}>{r}</span>;
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">User <span>Management</span></div>
        <div className="page-subtitle">Manage librarians, admins, and members</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">All Users</div>
          <div className="filter-bar">
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-primary" onClick={openCreate}>+ Add User</button>
          </div>
        </div>
        {loading ? <div className="loading">Loading</div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">◈</div><p>No users found</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Username</th><th>Role</th><th>Contact</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.userId}>
                  <td>#{u.userId}</td>
                  <td>{u.name || '—'}</td>
                  <td>{u.username}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td>{u.contact || '—'}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-edit" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => remove(u.userId)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit User' : 'Create User'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="johndoe" />
                  </div>
                  <div className="form-group">
                    <label>Password *</label>
                    <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                      <option>ADMIN</option>
                      <option>LIBRARIAN</option>
                      <option>MEMBER</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contact</label>
                    <input type="number" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="9876543210" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
