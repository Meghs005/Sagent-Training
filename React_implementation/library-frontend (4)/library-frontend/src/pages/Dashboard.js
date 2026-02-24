import React, { useEffect, useState } from 'react';
import { userApi, bookApi, issueApi, notifyApi } from '../api/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, books: 0, issues: 0, notifications: 0 });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userApi.getAll(), bookApi.getAll(), issueApi.getAll(), notifyApi.getAll()
    ]).then(([u, b, i, n]) => {
      setStats({ users: u.data.length, books: b.data.length, issues: i.data.length, notifications: n.data.length });
      setRecentIssues(i.data.slice(-5).reverse());
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusBadge = (s) => {
    const map = { ISSUED: 'badge-issued', RETURNED: 'badge-returned', OVERDUE: 'badge-overdue' };
    return <span className={`badge ${map[s] || 'badge-issued'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Library <span>Dashboard</span></div>
        <div className="page-subtitle">Real-time overview of library operations</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card yellow">
          <div className="stat-value">{loading ? '—' : stats.users}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-value">{loading ? '—' : stats.books}</div>
          <div className="stat-label">Books in Stock</div>
        </div>
        <div className="stat-card red">
          <div className="stat-value">{loading ? '—' : stats.issues}</div>
          <div className="stat-label">Active Issues</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{loading ? '—' : stats.notifications}</div>
          <div className="stat-label">Notifications</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Recent Issues</div>
        </div>
        {loading ? <div className="loading">Loading</div> : recentIssues.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">◎</div><p>No issues found</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Book</th>
                <th>User</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.map(i => (
                <tr key={i.bookIssueId}>
                  <td>#{i.bookIssueId}</td>
                  <td>{i.book?.title || '—'}</td>
                  <td>{i.user?.name || i.user?.username || '—'}</td>
                  <td>{i.issueDate}</td>
                  <td>{i.dueDate?.split('T')[0]}</td>
                  <td>{statusBadge(i.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
