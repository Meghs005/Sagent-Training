import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';

const StatusBadge = ({ issue }) => {
  const due = new Date(issue.dueDate);
  const now = new Date();
  let status = issue.status;
  let cls = 'badge-gray';
  if (status === 'ISSUED' && due < now) { status = 'OVERDUE'; cls = 'badge-red'; }
  else if (status === 'ISSUED') cls = 'badge-amber';
  else if (status === 'RETURNED') cls = 'badge-green';
  else if (status === 'PAID') cls = 'badge-blue';
  else if (status === 'LOST') cls = 'badge-red';
  return <span className={`badge ${cls}`}>{status}</span>;
};

export default function MyIssuesPage({ onNavigate }) {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    issueAPI.getByUser(user.userId).then(r => setIssues(r.data))
      .catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const filtered = filter === 'ALL' ? issues
    : issues.filter(i => {
        if (filter === 'OVERDUE') return i.status === 'ISSUED' && new Date(i.dueDate) < new Date();
        return i.status === filter;
      });

  const hasFine = issues.some(i => i.fineAmount && i.fineAmount > 0 && i.status !== 'PAID');

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Issued Books</h1>
          <p className="page-subtitle">{issues.length} total records</p>
        </div>
        <button className="btn btn-amber" onClick={() => onNavigate('search')}>Issue New Book</button>
      </div>

      {hasFine && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 600, color: '#991b1b' }}>💰 Pending Fine</span>
            <span style={{ fontSize: '0.875rem', color: '#b91c1c', marginLeft: '0.75rem' }}>You have unpaid fines. Please clear them.</span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => onNavigate('payment')}>Pay Now</button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'ISSUED', 'OVERDUE', 'RETURNED', 'PAID'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Author</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Fine</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate)' }}>
                    No records found
                  </td>
                </tr>
              ) : filtered.map(issue => {
                const due = new Date(issue.dueDate);
                const isOverdue = issue.status === 'ISSUED' && due < new Date();
                return (
                  <tr key={issue.bookIssueId}>
                    <td style={{ fontWeight: 500 }}>{issue.book?.title || '—'}</td>
                    <td>{issue.book?.author || '—'}</td>
                    <td>{issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : '—'}</td>
                    <td style={{ color: isOverdue ? 'var(--crimson)' : 'inherit' }}>
                      {due.toLocaleDateString()}
                    </td>
                    <td>{issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : '—'}</td>
                    <td>{issue.fineAmount ? <span style={{ color: 'var(--crimson)', fontWeight: 600 }}>₹{issue.fineAmount}</span> : '—'}</td>
                    <td><StatusBadge issue={issue} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
