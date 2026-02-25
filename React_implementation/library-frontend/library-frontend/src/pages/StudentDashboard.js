import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { issueAPI, notifyAPI } from '../services/api';

export default function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [issueRes, notifRes] = await Promise.all([
          issueAPI.getByUser(user.userId),
          notifyAPI.getByUser(user.userId),
        ]);
        setIssues(issueRes.data);
        setNotifs(notifRes.data);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [user]);

  const active = issues.filter(i => i.status === 'ISSUED');
  const overdue = issues.filter(i => {
    if (i.status !== 'ISSUED') return false;
    return new Date(i.dueDate) < new Date();
  });
  const returned = issues.filter(i => i.status === 'RETURNED');

  const StatusBadge = ({ status }) => {
    const map = { ISSUED: 'badge-amber', RETURNED: 'badge-green', OVERDUE: 'badge-red', LOST: 'badge-red', PAID: 'badge-blue' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good day, {user.name || user.username} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your library account.</p>
        </div>
        <button className="btn btn-amber" onClick={() => onNavigate('search')}>Browse Books</button>
      </div>

      <div className="stat-grid">
        <div className="stat-card amber">
          <div className="stat-icon">📖</div>
          <div className="stat-value">{active.length}</div>
          <div className="stat-label">Currently Issued</div>
        </div>
        <div className="stat-card crimson">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{overdue.length}</div>
          <div className="stat-label">Overdue Books</div>
        </div>
        <div className="stat-card forest">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{returned.length}</div>
          <div className="stat-label">Books Returned</div>
        </div>
        <div className="stat-card ink">
          <div className="stat-icon">🔔</div>
          <div className="stat-value">{notifs.length}</div>
          <div className="stat-label">Notifications</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Active Issues */}
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem' }}>Active Issues</h3>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('my-issues')}>View All</button>
          </div>
          {active.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="icon">📚</div>
              <p>No books currently issued</p>
            </div>
          ) : (
            <div>
              {active.slice(0, 4).map(issue => {
                const due = new Date(issue.dueDate);
                const isOverdue = due < new Date();
                return (
                  <div key={issue.bookIssueId} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{issue.book?.title || 'Unknown Book'}</div>
                      <div style={{ fontSize: '0.75rem', color: isOverdue ? 'var(--crimson)' : 'var(--slate)', marginTop: '0.2rem' }}>
                        Due: {due.toLocaleDateString()}
                        {isOverdue && ' — OVERDUE'}
                      </div>
                    </div>
                    <StatusBadge status={isOverdue ? 'OVERDUE' : issue.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem' }}>Recent Notifications</h3>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('notifications')}>View All</button>
          </div>
          {notifs.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="icon">🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifs.slice(0, 4).map(n => (
                <div key={n.id} className="notification-item">
                  <div className="notif-icon" style={{ background: 'var(--amber-pale)' }}>🔔</div>
                  <div className="notif-content">
                    <div className="desc">{n.message}</div>
                    <div className="time">{new Date(n.sentAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fine warning */}
      {overdue.length > 0 && (
        <div style={{ marginTop: '1.5rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#991b1b' }}>⚠️ You have overdue books!</div>
            <div style={{ fontSize: '0.875rem', color: '#b91c1c', marginTop: '0.25rem' }}>
              Fines may be imposed. Please return your books immediately.
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => onNavigate('payment')}>Pay Fine</button>
        </div>
      )}
    </div>
  );
}
