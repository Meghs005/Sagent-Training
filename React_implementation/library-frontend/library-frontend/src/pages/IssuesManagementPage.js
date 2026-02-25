import React, { useEffect, useState } from 'react';
import { issueAPI, stockAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function IssuesManagementPage({ onNavigate }) {
  const { addToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    issueAPI.getAll().then(r => setIssues(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const now = new Date();
  const filtered = issues.filter(i => {
    if (filter === 'ALL') return true;
    if (filter === 'OVERDUE') return i.status === 'ISSUED' && new Date(i.dueDate) < now;
    return i.status === filter;
  });

  const markReturned = async (issue) => {
    setUpdatingId(issue.bookIssueId);
    try {
      const today = new Date().toISOString().split('T')[0];
      await issueAPI.update(issue.bookIssueId, { ...issue, status: 'RETURNED', returnDate: today });

      // Update book availability
      if (issue.book) {
        await stockAPI.update(issue.book.bookId, {
          ...issue.book,
          availableQuantity: (issue.book.availableQuantity || 0) + 1,
        });
      }
      addToast('Book marked as returned!', 'success');
      load();
    } catch { addToast('Failed to update.', 'error'); }
    setUpdatingId(null);
  };

  const StatusBadge = ({ issue }) => {
    const due = new Date(issue.dueDate);
    const isOverdue = issue.status === 'ISSUED' && due < now;
    const status = isOverdue ? 'OVERDUE' : issue.status;
    const cls = { OVERDUE: 'badge-red', ISSUED: 'badge-amber', RETURNED: 'badge-green', PAID: 'badge-blue', LOST: 'badge-red' };
    return <span className={`badge ${cls[status] || 'badge-gray'}`}>{status}</span>;
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const overdueCount = issues.filter(i => i.status === 'ISSUED' && new Date(i.dueDate) < now).length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Issued Books</h1>
          <p className="page-subtitle">{issues.length} total records • {overdueCount} overdue</p>
        </div>
        {overdueCount > 0 && (
          <button className="btn btn-danger" onClick={() => { setFilter('OVERDUE'); }}>
            ⚠ {overdueCount} Overdue
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'ISSUED', 'OVERDUE', 'RETURNED', 'LOST', 'PAID'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}>
            {f}
            {f === 'OVERDUE' && overdueCount > 0 && (
              <span style={{ marginLeft: '0.375rem', background: 'var(--crimson)', color: 'white', borderRadius: '10px', padding: '0 6px', fontSize: '0.65rem' }}>
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Student</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--slate)', padding: '3rem' }}>No records</td></tr>
              ) : filtered.map(issue => {
                const due = new Date(issue.dueDate);
                const isOverdue = issue.status === 'ISSUED' && due < now;
                return (
                  <tr key={issue.bookIssueId}>
                    <td style={{ fontWeight: 500 }}>{issue.book?.title || '—'}</td>
                    <td>{issue.user?.name || issue.user?.username || '—'}</td>
                    <td>{issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : '—'}</td>
                    <td style={{ color: isOverdue ? 'var(--crimson)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                      {due.toLocaleDateString()}
                    </td>
                    <td>{issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : '—'}</td>
                    <td>{issue.fineAmount ? <span style={{ color: 'var(--crimson)', fontWeight: 600 }}>₹{issue.fineAmount}</span> : '—'}</td>
                    <td><StatusBadge issue={issue} /></td>
                    <td>
                      {issue.status === 'ISSUED' && (
                        <button className="btn btn-forest btn-sm"
                          onClick={() => markReturned(issue)}
                          disabled={updatingId === issue.bookIssueId}>
                          {updatingId === issue.bookIssueId ? '...' : 'Mark Returned'}
                        </button>
                      )}
                      {isOverdue && (
                        <button className="btn btn-danger btn-sm" style={{ marginLeft: '0.375rem' }}
                          onClick={() => onNavigate && onNavigate('fines')}>
                          Fine
                        </button>
                      )}
                    </td>
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
