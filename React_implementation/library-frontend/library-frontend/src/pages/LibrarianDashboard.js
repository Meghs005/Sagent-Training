import React, { useEffect, useState } from 'react';
import { stockAPI, issueAPI, userAPI } from '../services/api';

export default function LibrarianDashboard({ onNavigate }) {
  const [stats, setStats] = useState({ books: 0, users: 0, issued: 0, overdue: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [books, users, issues] = await Promise.all([
          stockAPI.getAll(),
          userAPI.getAll(),
          issueAPI.getAll(),
        ]);
        const now = new Date();
        const overdue = issues.data.filter(i => i.status === 'ISSUED' && new Date(i.dueDate) < now);
        const issued = issues.data.filter(i => i.status === 'ISSUED');
        setStats({ books: books.data.length, users: users.data.length, issued: issued.length, overdue: overdue.length });
        setRecentIssues(issues.data.slice(-5).reverse());
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const StatusBadge = ({ issue }) => {
    const due = new Date(issue.dueDate);
    const isOverdue = issue.status === 'ISSUED' && due < new Date();
    const status = isOverdue ? 'OVERDUE' : issue.status;
    const cls = { OVERDUE: 'badge-red', ISSUED: 'badge-amber', RETURNED: 'badge-green', PAID: 'badge-blue', LOST: 'badge-red' };
    return <span className={`badge ${cls[status] || 'badge-gray'}`}>{status}</span>;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Librarian Dashboard</h1>
          <p className="page-subtitle">Overview of library operations</p>
        </div>
        <button className="btn btn-amber" onClick={() => onNavigate('books')}>+ Add Book</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card amber" style={{ cursor: 'pointer' }} onClick={() => onNavigate('books')}>
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.books}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card forest" style={{ cursor: 'pointer' }} onClick={() => onNavigate('users')}>
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.users}</div>
          <div className="stat-label">Registered Users</div>
        </div>
        <div className="stat-card ink" style={{ cursor: 'pointer' }} onClick={() => onNavigate('issues')}>
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats.issued}</div>
          <div className="stat-label">Books Issued</div>
        </div>
        <div className="stat-card crimson" style={{ cursor: 'pointer' }} onClick={() => onNavigate('fines')}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{stats.overdue}</div>
          <div className="stat-label">Overdue Books</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Issue Activity</h3>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('issues')}>View All</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Student</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Fine</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--slate)', padding: '2rem' }}>No issue records</td></tr>
                ) : recentIssues.map(issue => (
                  <tr key={issue.bookIssueId}>
                    <td style={{ fontWeight: 500 }}>{issue.book?.title || '—'}</td>
                    <td>{issue.user?.name || issue.user?.username || '—'}</td>
                    <td>{issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : '—'}</td>
                    <td>{new Date(issue.dueDate).toLocaleDateString()}</td>
                    <td>{issue.fineAmount ? <span style={{ color: 'var(--crimson)', fontWeight: 600 }}>₹{issue.fineAmount}</span> : '—'}</td>
                    <td><StatusBadge issue={issue} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ minWidth: 220 }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Actions</h3>
            {[
              { label: 'Manage Books', icon: '📚', page: 'books', color: 'var(--amber)' },
              { label: 'Issued Books', icon: '📋', page: 'issues', color: 'var(--ink)' },
              { label: 'Fine Management', icon: '💰', page: 'fines', color: 'var(--crimson)' },
              { label: 'User Management', icon: '👥', page: 'users', color: 'var(--forest)' },
              { label: 'Notifications', icon: '🔔', page: 'notifications', color: 'var(--amber)' },
            ].map(a => (
              <button key={a.page} onClick={() => onNavigate(a.page)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '0.25rem', transition: 'background 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--paper)'}
                onMouseOut={e => e.currentTarget.style.background = 'none'}>
                <span style={{ fontSize: '1.25rem' }}>{a.icon}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
