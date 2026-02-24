import React, { useEffect, useState } from 'react';
import { issueApi, userApi, bookApi, fineUtils, FINE_RATES } from '../api/api';

const today = new Date().toISOString().split('T')[0];

const emptyIssue = {
  user: null, book: null,
  issueDate: today, returnDate: '', dueDate: '',
  fineAmount: 0, status: 'ISSUED', condition: 'GOOD',
};

export default function IssuesPage() {
  const [issues, setIssues]       = useState([]);
  const [users, setUsers]         = useState([]);
  const [books, setBooks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(emptyIssue);
  const [statusFilter, setFilter] = useState('');
  const [finePreview, setFinePreview] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([issueApi.getAll(), userApi.getAll(), bookApi.getAll()])
      .then(([i, u, b]) => { setIssues(i.data); setUsers(u.data); setBooks(b.data); })
      .catch(() => setError('Failed to load issues'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Recalculate fine whenever relevant form fields change
  useEffect(() => {
    if (!form.dueDate) { setFinePreview(null); return; }
    const result = fineUtils.calcTotalFine({
      dueDate: form.dueDate,
      returnDate: form.returnDate || null,
      status: form.status,
      condition: form.condition,
    });
    setFinePreview(result);
    // Auto-set fine amount
    setForm(prev => ({ ...prev, fineAmount: result.totalFine }));
  }, [form.dueDate, form.returnDate, form.status, form.condition]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyIssue, user: users[0] ? { userId: users[0].userId } : null, book: books[0] ? { bookId: books[0].bookId } : null });
    setFinePreview(null);
    setModal(true); setError('');
  };

  const openEdit = (iss) => {
    setEditing(iss.bookIssueId);
    const condition = iss.status === 'LOST' ? 'LOST' : iss.status === 'TORN' ? 'TORN' : 'GOOD';
    setForm({
      user: iss.user,
      book: iss.book,
      issueDate: iss.issueDate || today,
      returnDate: iss.returnDate || '',
      dueDate: iss.dueDate ? iss.dueDate.split('T')[0] : '',
      fineAmount: iss.fineAmount || 0,
      status: iss.status,
      condition,
    });
    setModal(true); setError('');
  };

  const handleConditionChange = (cond) => {
    let status = form.status;
    if (cond === 'LOST') status = 'LOST';
    else if (cond === 'TORN') status = 'TORN';
    else status = fineUtils.resolveStatus(form.dueDate, 'ISSUED');
    setForm(prev => ({ ...prev, condition: cond, status }));
  };

  const handleStatusChange = (s) => {
    let condition = form.condition;
    if (s === 'LOST') condition = 'LOST';
    else if (s === 'TORN') condition = 'TORN';
    else if (condition === 'LOST' || condition === 'TORN') condition = 'GOOD';
    setForm(prev => ({ ...prev, status: s, condition }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const autoStatus = fineUtils.resolveStatus(form.dueDate, form.status);
      const payload = {
        issueDate: form.issueDate,
        returnDate: form.returnDate || null,
        dueDate: form.dueDate ? form.dueDate + 'T00:00:00' : null,
        fineAmount: Number(form.fineAmount),
        status: autoStatus,
        user: form.user?.userId ? { userId: Number(form.user.userId) } : null,
        book: form.book?.bookId ? { bookId: Number(form.book.bookId) } : null,
      };
      if (editing) await issueApi.update(editing, payload);
      else await issueApi.create(payload);
      setModal(false); load();
    } catch (err) { setError(err.message || 'Failed to save issue'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this issue?')) return;
    try { await issueApi.delete(id); load(); } catch { setError('Failed to delete'); }
  };

  const statusBadge = (s) => {
    const map = {
      ISSUED: 'badge-issued',
      RETURNED: 'badge-returned',
      OVERDUE: 'badge-overdue',
      LOST: 'badge-lost',
      TORN: 'badge-torn',
    };
    return <span className={`badge ${map[s] || 'badge-issued'}`}>{s}</span>;
  };

  const conditionIcon = (s) => {
    if (s === 'LOST') return '🚫';
    if (s === 'TORN') return '📄';
    if (s === 'OVERDUE') return '⏰';
    if (s === 'RETURNED') return '✅';
    return '📗';
  };

  const filtered = issues.filter(i => !statusFilter || i.status === statusFilter);

  // Summary stats
  const totalFines = issues.reduce((sum, i) => sum + (i.fineAmount || 0), 0);
  const overdueCount = issues.filter(i => i.status === 'OVERDUE').length;
  const lostCount = issues.filter(i => i.status === 'LOST').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Book <span>Issues</span></div>
        <div className="page-subtitle">Track issued books, due dates, fines, lost &amp; damaged records</div>
      </div>

      {/* Fine rate info bar */}
      <div className="fine-info-bar">
        <div className="fine-info-item">
          <span className="fine-info-icon">📅</span>
          <span>Overdue fine: <strong>₹{FINE_RATES.PER_DAY_OVERDUE}/day</strong></span>
        </div>
        <div className="fine-info-item">
          <span className="fine-info-icon">🚫</span>
          <span>Lost book: <strong>₹{FINE_RATES.LOST_BOOK_FLAT} flat</strong></span>
        </div>
        <div className="fine-info-item">
          <span className="fine-info-icon">📄</span>
          <span>Damaged/torn: <strong>₹{FINE_RATES.TORN_BOOK_FLAT} flat</strong></span>
        </div>
        <div className="fine-info-sep" />
        <div className="fine-info-item accent">
          <span>Total Fines Collected: <strong>₹{totalFines.toFixed(2)}</strong></span>
        </div>
        <div className="fine-info-item warn">
          <span>Overdue: <strong>{overdueCount}</strong></span>
        </div>
        <div className="fine-info-item danger">
          <span>Lost: <strong>{lostCount}</strong></span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">Issue Records</div>
          <div className="filter-bar">
            <select value={statusFilter} onChange={e => setFilter(e.target.value)}>
              <option value="">All Status</option>
              <option>ISSUED</option>
              <option>RETURNED</option>
              <option>OVERDUE</option>
              <option>LOST</option>
              <option>TORN</option>
            </select>
            <button className="btn btn-primary" onClick={openCreate}>+ New Issue</button>
          </div>
        </div>

        {loading ? <div className="loading">Loading</div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">◎</div><p>No issues found</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Book</th>
                <th>User</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Overdue Days</th>
                <th>Fine (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(iss => {
                const { overdueDays } = fineUtils.calcOverdueFine(iss.dueDate, iss.returnDate || null);
                return (
                  <tr key={iss.bookIssueId}>
                    <td>#{iss.bookIssueId}</td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conditionIcon(iss.status)} {iss.book?.title || '—'}
                    </td>
                    <td>{iss.user?.name || iss.user?.username || '—'}</td>
                    <td>{iss.issueDate}</td>
                    <td>
                      <span style={{ color: overdueDays > 0 && iss.status !== 'RETURNED' ? 'var(--error)' : 'inherit' }}>
                        {iss.dueDate?.split('T')[0] || '—'}
                      </span>
                    </td>
                    <td>{iss.returnDate || '—'}</td>
                    <td>
                      {overdueDays > 0
                        ? <span className="overdue-days">+{overdueDays}d</span>
                        : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                    </td>
                    <td>
                      {iss.fineAmount > 0
                        ? <span className="fine-amount">₹{Number(iss.fineAmount).toFixed(2)}</span>
                        : <span style={{ color: 'var(--text-dim)' }}>₹0</span>}
                    </td>
                    <td>{statusBadge(iss.status)}</td>
                    <td>
                      <div className="action-cell">
                        <button className="btn btn-edit" onClick={() => openEdit(iss)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => remove(iss.bookIssueId)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal modal-wide">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Issue' : 'Create Issue'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Book *</label>
                    <select required value={form.book?.bookId || ''} onChange={e => setForm({ ...form, book: { bookId: Number(e.target.value) } })}>
                      <option value="">Select book</option>
                      {books.map(b => <option key={b.bookId} value={b.bookId}>{b.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>User *</label>
                    <select required value={form.user?.userId || ''} onChange={e => setForm({ ...form, user: { userId: Number(e.target.value) } })}>
                      <option value="">Select user</option>
                      {users.map(u => <option key={u.userId} value={u.userId}>{u.name || u.username}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Issue Date *</label>
                    <input required type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Due Date *</label>
                    <input required type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Return Date</label>
                    <input type="date" value={form.returnDate} onChange={e => setForm({ ...form, returnDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select value={form.status} onChange={e => handleStatusChange(e.target.value)}>
                      <option>ISSUED</option>
                      <option>RETURNED</option>
                      <option>OVERDUE</option>
                      <option>LOST</option>
                      <option>TORN</option>
                    </select>
                  </div>
                </div>

                {/* Book Condition Selector */}
                <div style={{ marginTop: '20px' }}>
                  <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                    Book Condition
                  </label>
                  <div className="condition-cards">
                    {[
                      { val: 'GOOD',  icon: '📗', label: 'Good',    desc: 'Returned in good condition', fine: 'No extra fine' },
                      { val: 'TORN',  icon: '📄', label: 'Damaged', desc: 'Torn, stained, or damaged',  fine: `₹${FINE_RATES.TORN_BOOK_FLAT} penalty` },
                      { val: 'LOST',  icon: '🚫', label: 'Lost',    desc: 'Book is lost or missing',    fine: `₹${FINE_RATES.LOST_BOOK_FLAT} penalty` },
                    ].map(c => (
                      <button
                        type="button"
                        key={c.val}
                        className={`condition-card ${form.condition === c.val ? 'selected' : ''}`}
                        onClick={() => handleConditionChange(c.val)}
                      >
                        <div className="condition-icon">{c.icon}</div>
                        <div className="condition-label">{c.label}</div>
                        <div className="condition-desc">{c.desc}</div>
                        <div className={`condition-fine ${c.val !== 'GOOD' ? 'has-fine' : ''}`}>{c.fine}</div>
                        {form.condition === c.val && <div className="condition-check">✓</div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fine Preview Panel */}
                {finePreview !== null && (
                  <div className={`fine-preview ${finePreview.totalFine > 0 ? 'has-fine' : 'no-fine'}`}>
                    <div className="fine-preview-title">
                      {finePreview.totalFine > 0 ? '⚠️ Fine Breakdown' : '✅ No Fine'}
                    </div>
                    {finePreview.breakdown.length > 0 ? (
                      finePreview.breakdown.map((line, i) => (
                        <div key={i} className={`fine-line ${line.startsWith('Total') ? 'fine-total-line' : ''}`}>{line}</div>
                      ))
                    ) : (
                      <div className="fine-line">Book returned on time in good condition.</div>
                    )}
                  </div>
                )}

                {/* Fine Amount (auto-calculated but editable) */}
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Fine Amount ₹ (auto-calculated · editable)</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.fineAmount}
                    onChange={e => setForm({ ...form, fineAmount: e.target.value })}
                    style={{ borderColor: form.fineAmount > 0 ? 'var(--error)' : undefined }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Update Issue' : 'Create Issue'}
                  {form.fineAmount > 0 && ` · ₹${Number(form.fineAmount).toFixed(2)} fine`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
