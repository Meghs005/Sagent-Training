import React, { useEffect, useState } from 'react';
import { issueAPI, notifyAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function FineManagementPage() {
  const { addToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fineModal, setFineModal] = useState(null);
  const [fineForm, setFineForm] = useState({ amount: '', reason: 'LATE_RETURN', note: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    issueAPI.getAll().then(r => {
      const now = new Date();
      const relevant = r.data.filter(i =>
        (i.status === 'ISSUED' && new Date(i.dueDate) < now) ||
        i.status === 'LOST' ||
        (i.fineAmount && i.fineAmount > 0)
      );
      setIssues(relevant);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openFineModal = (issue) => {
    const now = new Date();
    const due = new Date(issue.dueDate);
    const days = issue.status === 'LOST' ? 0 : Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
    const suggested = issue.status === 'LOST' ? 500 : days * 5;
    setFineForm({ amount: issue.fineAmount || suggested, reason: issue.status === 'LOST' ? 'LOST_BOOK' : 'LATE_RETURN', note: '' });
    setFineModal(issue);
  };

  const handleApplyFine = async () => {
    if (!fineForm.amount || isNaN(fineForm.amount)) { addToast('Enter a valid fine amount.', 'error'); return; }
    setSaving(true);
    try {
      const newStatus = fineForm.reason === 'LOST_BOOK' ? 'LOST' : fineModal.status;
      await issueAPI.update(fineModal.bookIssueId, {
        ...fineModal,
        fineAmount: Number(fineForm.amount),
        status: newStatus,
      });
      // Send notification
      try {
        await notifyAPI.create({
          message: `Fine of ₹${fineForm.amount} imposed for ${fineForm.reason === 'LOST_BOOK' ? 'lost book' : 'late return'}: "${fineModal.book?.title}". ${fineForm.note || ''}`,
          sentAt: new Date().toISOString().split('T')[0],
          bookIssue: { bookIssueId: fineModal.bookIssueId },
          user: fineModal.user,
        });
      } catch (_) {}
      addToast(`Fine of ₹${fineForm.amount} applied!`, 'success');
      setFineModal(null);
      load();
    } catch { addToast('Failed to apply fine.', 'error'); }
    setSaving(false);
  };

  const StatusBadge = ({ issue }) => {
    const now = new Date();
    const isOverdue = issue.status === 'ISSUED' && new Date(issue.dueDate) < now;
    if (isOverdue) return <span className="badge badge-red">OVERDUE</span>;
    const cls = { ISSUED: 'badge-amber', RETURNED: 'badge-green', LOST: 'badge-red', PAID: 'badge-blue' };
    return <span className={`badge ${cls[issue.status] || 'badge-gray'}`}>{issue.status}</span>;
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fine Management</h1>
          <p className="page-subtitle">{issues.length} records requiring attention</p>
        </div>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem' }}>
        <div className="stat-card crimson">
          <div className="stat-icon">⏰</div>
          <div className="stat-value">{issues.filter(i => i.status === 'ISSUED' && new Date(i.dueDate) < new Date()).length}</div>
          <div className="stat-label">Overdue</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon">📕</div>
          <div className="stat-value">{issues.filter(i => i.status === 'LOST').length}</div>
          <div className="stat-label">Lost Books</div>
        </div>
        <div className="stat-card forest">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{issues.reduce((s, i) => s + (i.fineAmount || 0), 0).toFixed(0)}</div>
          <div className="stat-label">Total Fines Imposed</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Student</th>
                <th>Due Date</th>
                <th>Days Overdue</th>
                <th>Fine Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--slate)', padding: '3rem' }}>
                  No overdue or fined books
                </td></tr>
              ) : issues.map(issue => {
                const due = new Date(issue.dueDate);
                const now = new Date();
                const days = Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
                return (
                  <tr key={issue.bookIssueId}>
                    <td style={{ fontWeight: 500 }}>{issue.book?.title || '—'}</td>
                    <td>{issue.user?.name || issue.user?.username || '—'}</td>
                    <td>{due.toLocaleDateString()}</td>
                    <td>
                      {days > 0 ? (
                        <span style={{ color: 'var(--crimson)', fontWeight: 600 }}>{days} days</span>
                      ) : '—'}
                    </td>
                    <td>
                      {issue.fineAmount ? (
                        <span style={{ color: 'var(--crimson)', fontWeight: 700 }}>₹{issue.fineAmount}</span>
                      ) : '—'}
                    </td>
                    <td><StatusBadge issue={issue} /></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => openFineModal(issue)}>
                        {issue.fineAmount ? 'Update Fine' : 'Impose Fine'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fine Modal */}
      {fineModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setFineModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Impose Fine</h2>
              <button className="modal-close" onClick={() => setFineModal(null)}>×</button>
            </div>

            <div style={{ background: 'var(--paper)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{fineModal.book?.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate)', marginTop: '0.25rem' }}>
                Student: {fineModal.user?.name || fineModal.user?.username}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--crimson)', marginTop: '0.2rem' }}>
                Due: {new Date(fineModal.dueDate).toLocaleDateString()} ·
                {Math.max(0, Math.floor((new Date() - new Date(fineModal.dueDate)) / (1000 * 60 * 60 * 24)))} days overdue
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <select className="input-field" value={fineForm.reason}
                onChange={e => setFineForm(f => ({ ...f, reason: e.target.value }))}>
                <option value="LATE_RETURN">Late Return</option>
                <option value="LOST_BOOK">Lost Book</option>
                <option value="DAMAGED_BOOK">Damaged Book</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fine Amount (₹)</label>
              <input type="number" min={0} className="input-field"
                value={fineForm.amount}
                onChange={e => setFineForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="e.g. 50" />
              <div style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.375rem' }}>
                Suggested: ₹5/day for late returns, ₹500 for lost books
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Additional Note</label>
              <textarea className="input-field" rows={2}
                value={fineForm.note}
                onChange={e => setFineForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Optional note to student..." />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setFineModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleApplyFine} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Applying...' : 'Apply Fine & Notify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
