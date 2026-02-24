import React, { useEffect, useState } from 'react';
import { notifyApi, userApi, issueApi } from '../api/api';

const today = new Date().toISOString().split('T')[0];
const emptyNotify = { message: '', sentAt: today, bookIssue: null, user: null };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyNotify);
  const [userFilter, setUserFilter] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([notifyApi.getAll(), userApi.getAll(), issueApi.getAll()])
      .then(([n, u, i]) => { setNotifications(n.data); setUsers(u.data); setIssues(i.data); })
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyNotify, user: users[0] ? { userId: users[0].userId } : null, bookIssue: issues[0] ? { bookIssueId: issues[0].bookIssueId } : null });
    setModal(true); setError('');
  };

  const openEdit = (n) => {
    setEditing(n.id);
    setForm({ message: n.message, sentAt: n.sentAt, bookIssue: n.bookIssue, user: n.user });
    setModal(true); setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        user: form.user?.userId ? { userId: Number(form.user.userId) } : null,
        bookIssue: form.bookIssue?.bookIssueId ? { bookIssueId: Number(form.bookIssue.bookIssueId) } : null,
      };
      if (editing) await notifyApi.update(editing, payload);
      else await notifyApi.create(payload);
      setModal(false); load();
    } catch { setError('Failed to save notification'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try { await notifyApi.delete(id); load(); } catch { setError('Failed to delete'); }
  };

  const filtered = notifications.filter(n => !userFilter || String(n.user?.userId) === userFilter);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Notification <span>Center</span></div>
        <div className="page-subtitle">Manage overdue alerts and user notifications</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">All Notifications</div>
          <div className="filter-bar">
            <select value={userFilter} onChange={e => setUserFilter(e.target.value)}>
              <option value="">All Users</option>
              {users.map(u => <option key={u.userId} value={u.userId}>{u.name || u.username}</option>)}
            </select>
            <button className="btn btn-primary" onClick={openCreate}>+ Send Notification</button>
          </div>
        </div>
        {loading ? <div className="loading">Loading</div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">◌</div><p>No notifications found</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Message</th><th>User</th><th>Issue Ref</th><th>Sent At</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(n => (
                <tr key={n.id}>
                  <td>#{n.id}</td>
                  <td style={{maxWidth:'260px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{n.message}</td>
                  <td>{n.user?.name || n.user?.username || '—'}</td>
                  <td>{n.bookIssue ? <span className="badge badge-issued">Issue #{n.bookIssue.bookIssueId}</span> : '—'}</td>
                  <td>{n.sentAt}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-edit" onClick={() => openEdit(n)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => remove(n.id)}>Delete</button>
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
              <div className="modal-title">{editing ? 'Edit Notification' : 'Send Notification'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Message *</label>
                    <textarea required rows={3} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Your book is overdue. Please return it..." style={{resize:'vertical'}} />
                  </div>
                  <div className="form-group">
                    <label>User *</label>
                    <select required value={form.user?.userId || ''} onChange={e => setForm({...form, user: { userId: Number(e.target.value) }})}>
                      <option value="">Select user</option>
                      {users.map(u => <option key={u.userId} value={u.userId}>{u.name || u.username}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Issue Reference *</label>
                    <select required value={form.bookIssue?.bookIssueId || ''} onChange={e => setForm({...form, bookIssue: { bookIssueId: Number(e.target.value) }})}>
                      <option value="">Select issue</option>
                      {issues.map(i => <option key={i.bookIssueId} value={i.bookIssueId}>#{i.bookIssueId} – {i.book?.title || 'Book'}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sent At *</label>
                    <input required type="date" value={form.sentAt} onChange={e => setForm({...form, sentAt: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Send'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
