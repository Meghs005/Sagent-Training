import React, { useEffect, useState } from 'react';
import { userAPI, issueAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function UserManagementPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userIssues, setUserIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);

  useEffect(() => {
    Promise.all([userAPI.getAll(), issueAPI.getAll()])
      .then(([u, i]) => { setUsers(u.data); setIssues(i.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const viewUserDetails = async (user) => {
    setSelectedUser(user);
    setLoadingIssues(true);
    try {
      const res = await issueAPI.getByUser(user.userId);
      setUserIssues(res.data);
    } catch { setUserIssues([]); }
    setLoadingIssues(false);
  };

  const getUserStats = (userId) => {
    const userIssues = issues.filter(i => i.user?.userId === userId);
    const active = userIssues.filter(i => i.status === 'ISSUED');
    const overdue = userIssues.filter(i => i.status === 'ISSUED' && new Date(i.dueDate) < new Date());
    const fined = userIssues.reduce((s, i) => s + (i.fineAmount || 0), 0);
    return { total: userIssues.length, active: active.length, overdue: overdue.length, fined };
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input className="input-field" style={{ maxWidth: 360 }}
          placeholder="Search by name or username..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 380px' : '1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Active Issues</th>
                  <th>Overdue</th>
                  <th>Pending Fine</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--slate)', padding: '3rem' }}>No users found</td></tr>
                ) : filtered.map(u => {
                  const stats = getUserStats(u.userId);
                  return (
                    <tr key={u.userId} style={{ cursor: 'pointer' }} onClick={() => viewUserDetails(u)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>
                            {(u.name || u.username || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name || u.username}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--slate)' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'LIBRARIAN' ? 'badge-blue' : 'badge-gray'}`}>
                          {u.role || 'STUDENT'}
                        </span>
                      </td>
                      <td>{u.contact || '—'}</td>
                      <td>{stats.active}</td>
                      <td>
                        {stats.overdue > 0 ? (
                          <span style={{ color: 'var(--crimson)', fontWeight: 600 }}>{stats.overdue}</span>
                        ) : '0'}
                      </td>
                      <td>
                        {stats.fined > 0 ? (
                          <span style={{ color: 'var(--crimson)', fontWeight: 600 }}>₹{stats.fined}</span>
                        ) : '—'}
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); viewUserDetails(u); }}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User detail panel */}
        {selectedUser && (
          <div className="card fade-in" style={{ padding: '1.5rem', alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}>User Details</h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--paper)', borderRadius: 'var(--radius)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>
                {(selectedUser.name || selectedUser.username || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{selectedUser.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>@{selectedUser.username}</div>
                <span className="badge badge-blue" style={{ marginTop: '0.25rem' }}>{selectedUser.role || 'STUDENT'}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--slate)' }}>Contact</span>
                <span>{selectedUser.contact || '—'}</span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--slate)', marginBottom: '0.75rem' }}>Issue History</h4>
            {loadingIssues ? (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : userIssues.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--slate)', fontSize: '0.875rem', padding: '1rem' }}>No issue history</div>
            ) : (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {userIssues.map(issue => {
                  const due = new Date(issue.dueDate);
                  const isOverdue = issue.status === 'ISSUED' && due < new Date();
                  return (
                    <div key={issue.bookIssueId} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{issue.book?.title}</div>
                      <div style={{ fontSize: '0.75rem', color: isOverdue ? 'var(--crimson)' : 'var(--slate)', marginTop: '0.2rem' }}>
                        Due: {due.toLocaleDateString()} · {isOverdue ? '⚠ OVERDUE' : issue.status}
                        {issue.fineAmount ? ` · Fine: ₹${issue.fineAmount}` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
