import React, { useEffect, useState, useCallback } from 'react';
import { bookApi, userApi, issueApi, notifyApi, fineUtils, FINE_RATES } from '../api/api';
import './LibrarianPortal.css';

const today = new Date().toISOString().split('T')[0];

const Modal = ({ title, onClose, children, footer, wide }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className={`modal ${wide ? 'modal-wide' : ''}`}>
      <div className="modal-header">
        <div className="modal-title">{title}</div>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

export default function LibrarianPortal({ currentUser }) {
  const [tab, setTab]         = useState('dashboard');
  const [books, setBooks]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [issues, setIssues]   = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Book
  const [bookModal, setBookModal]     = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm]       = useState({ title: '', author: '', subject: '', totalQuantity: 1, availableQuantity: 1, status: 'ACTIVE' });
  const [bookSearch, setBookSearch]   = useState('');

  // User
  const [userModal, setUserModal]     = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm]       = useState({ username: '', password: '', name: '', role: 'MEMBER', contact: '' });
  const [userSearch, setUserSearch]   = useState('');

  // Fine / Issue
  const [fineModal, setFineModal]         = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [fineForm, setFineForm]           = useState({ status: 'ISSUED', condition: 'GOOD', returnDate: '', fineAmount: 0 });
  const [finePreview, setFinePreview]     = useState(null);
  const [issueFilter, setIssueFilter]     = useState('');

  // Notify
  const [notifyModal, setNotifyModal] = useState(false);
  const [notifyForm, setNotifyForm]   = useState({ message: '', sentAt: today, user: '', bookIssue: '' });

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, u, i, n] = await Promise.all([
        bookApi.getAll(), userApi.getAll(), issueApi.getAll(), notifyApi.getAll()
      ]);
      setBooks(b.data);
      setUsers(u.data);
      setIssues(i.data);
      setNotifications(n.data);
    } catch {
      setError('Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-calc fine when fine form changes
  useEffect(() => {
    if (!selectedIssue) { setFinePreview(null); return; }
    const result = fineUtils.calcTotalFine({
      dueDate:    selectedIssue.dueDate,
      returnDate: fineForm.returnDate || null,
      status:     fineForm.status,
      condition:  fineForm.condition,
    });
    setFinePreview(result);
    setFineForm(prev => ({ ...prev, fineAmount: result.totalFine }));
  }, [fineForm.returnDate, fineForm.status, fineForm.condition, selectedIssue]); // eslint-disable-line

  // ── BOOK HANDLERS ─────────────────────────────────────────────────────────
  const openAddBook = () => {
    setEditingBook(null);
    setBookForm({ title: '', author: '', subject: '', totalQuantity: 1, availableQuantity: 1, status: 'ACTIVE' });
    setError('');
    setBookModal(true);
  };

  const openEditBook = (b) => {
    setEditingBook(b.bookId);
    setBookForm({ title: b.title, author: b.author || '', subject: b.subject || '', totalQuantity: b.totalQuantity, availableQuantity: b.availableQuantity, status: b.status || 'ACTIVE' });
    setError('');
    setBookModal(true);
  };

  const submitBook = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bookForm,
        totalQuantity:     Number(bookForm.totalQuantity),
        availableQuantity: Number(bookForm.availableQuantity),
        user: { userId: currentUser.userId },
      };
      if (editingBook) await bookApi.update(editingBook, payload);
      else             await bookApi.create(payload);
      setBookModal(false);
      load();
      showSuccess(editingBook ? 'Book updated successfully!' : 'Book added successfully!');
    } catch {
      setError('Failed to save book. Check all fields.');
    }
  };

  const deleteBook = async (id) => {
    setError('');
    if (!window.confirm('Delete this book?')) return;
    try {
      await bookApi.delete(id);
      load();
      showSuccess('Book deleted.');
    } catch {
      setError('Cannot delete this book — it may have active issues linked to it. Close or return those issues first.');
    }
  };

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.subject?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  // ── USER HANDLERS ─────────────────────────────────────────────────────────
  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', password: '', name: '', role: 'MEMBER', contact: '' });
    setError('');
    setUserModal(true);
  };

  const openEditUser = (u) => {
    setEditingUser(u.userId);
    setUserForm({ username: u.username, password: u.password || '', name: u.name || '', role: u.role, contact: u.contact || '' });
    setError('');
    setUserModal(true);
  };

  const submitUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...userForm, contact: userForm.contact ? Number(userForm.contact) : null };
      if (editingUser) await userApi.update(editingUser, payload);
      else             await userApi.create(payload);
      setUserModal(false);
      load();
      showSuccess(editingUser ? 'User updated!' : 'User created!');
    } catch {
      setError('Failed to save user. Username may already exist.');
    }
  };

  const deleteUser = async (id) => {
    setError('');
    if (!window.confirm('Delete this user?')) return;
    try {
      await userApi.delete(id);
      load();
      showSuccess('User deleted.');
    } catch {
      setError('Cannot delete this user — they have book issues or records linked. Resolve those first, then delete.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── FINE HANDLERS ─────────────────────────────────────────────────────────
  const openFineModal = (iss) => {
    setSelectedIssue(iss);
    const cond = iss.status === 'LOST' ? 'LOST' : iss.status === 'TORN' ? 'TORN' : 'GOOD';
    setFineForm({ status: iss.status, condition: cond, returnDate: iss.returnDate || '', fineAmount: iss.fineAmount || 0 });
    setError('');
    setFineModal(true);
  };

  const handleCondChange = (cond) => {
    let status = fineForm.status;
    if (cond === 'LOST')      status = 'LOST';
    else if (cond === 'TORN') status = 'TORN';
    else                      status = fineUtils.resolveStatus(selectedIssue?.dueDate, 'ISSUED');
    setFineForm(prev => ({ ...prev, condition: cond, status }));
  };

  const submitFine = async (e) => {
    e.preventDefault();
    try {
      const autoStatus = fineUtils.resolveStatus(selectedIssue.dueDate, fineForm.status);
      await issueApi.update(selectedIssue.bookIssueId, {
        issueDate:  selectedIssue.issueDate,
        returnDate: fineForm.returnDate || null,
        dueDate:    selectedIssue.dueDate,
        fineAmount: Number(fineForm.fineAmount),
        status:     autoStatus,
        user:       { userId: selectedIssue.user?.userId },
        book:       { bookId: selectedIssue.book?.bookId },
      });
      // Auto-notify student if fine > 0
      if (Number(fineForm.fineAmount) > 0) {
        const reason = fineForm.condition === 'LOST' ? 'Book Lost'
                     : fineForm.condition === 'TORN' ? 'Book Damaged/Torn'
                     : 'Overdue Return';
        await notifyApi.create({
          message:   `Fine of ₹${fineForm.fineAmount} has been applied for "${selectedIssue.book?.title}". Reason: ${reason}. Please pay at the library counter.`,
          sentAt:    today,
          user:      { userId: selectedIssue.user?.userId },
          bookIssue: { bookIssueId: selectedIssue.bookIssueId },
        });
      }
      setFineModal(false);
      load();
      showSuccess('Issue updated & student notified!');
    } catch {
      setError('Failed to update issue. Try again.');
    }
  };

  const filteredIssues = issues.filter(i => !issueFilter || i.status === issueFilter);

  // ── NOTIFY HANDLERS ───────────────────────────────────────────────────────
  const submitNotify = async (e) => {
    e.preventDefault();
    try {
      await notifyApi.create({
        message:   notifyForm.message,
        sentAt:    notifyForm.sentAt,
        user:      { userId: Number(notifyForm.user) },
        bookIssue: { bookIssueId: Number(notifyForm.bookIssue) },
      });
      setNotifyModal(false);
      load();
      showSuccess('Notification sent!');
    } catch {
      setError('Failed to send notification.');
    }
  };

  const deleteNotify = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try { await notifyApi.delete(id); load(); showSuccess('Notification deleted.'); }
    catch { setError('Failed to delete notification.'); }
  };

  // ── BADGES ────────────────────────────────────────────────────────────────
  const statusBadge = (s) => {
    const map = { ISSUED: 'badge-issued', RETURNED: 'badge-returned', OVERDUE: 'badge-overdue', LOST: 'badge-lost', TORN: 'badge-torn' };
    return <span className={`badge ${map[s] || 'badge-issued'}`}>{s}</span>;
  };

  const roleBadge = (r) => {
    const map = { ADMIN: 'badge-admin', LIBRARIAN: 'badge-librarian', MEMBER: 'badge-member' };
    return <span className={`badge ${map[r] || 'badge-member'}`}>{r}</span>;
  };

  // ── COMPUTED ──────────────────────────────────────────────────────────────
  const pendingFines = issues.filter(i => i.fineAmount > 0 && i.status !== 'RETURNED');
  const totalFines   = issues.reduce((s, i) => s + (i.fineAmount || 0), 0);
  const overdueCount = issues.filter(i => i.status === 'OVERDUE').length;

  const TABS = [
    { id: 'dashboard',     label: '⬡ Dashboard' },
    { id: 'books',         label: '◉ Book Stock' },
    { id: 'users',         label: '◈ Users' },
    { id: 'issues',        label: '◎ Issues & Fines' },
    { id: 'notifications', label: '◌ Notifications' },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* TAB BAR */}
      <div className="lib-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`lib-tab ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}>
            {t.label}
            {t.id === 'issues'        && overdueCount > 0       && <span className="tab-alert">{overdueCount}</span>}
            {t.id === 'notifications' && pendingFines.length > 0 && <span className="tab-alert">{pendingFines.length}</span>}
          </button>
        ))}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* ── DASHBOARD ─────────────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div>
          <div className="page-header">
            <div className="page-title">Librarian <span>Dashboard</span></div>
            <div className="page-subtitle">Welcome back, {currentUser.name || currentUser.username}</div>
          </div>

          <div className="stats-grid">
            <div className="stat-card yellow">
              <div className="stat-value">{loading ? '—' : books.length}</div>
              <div className="stat-label">Total Books</div>
            </div>
            <div className="stat-card purple">
              <div className="stat-value">{loading ? '—' : users.length}</div>
              <div className="stat-label">Registered Users</div>
            </div>
            <div className="stat-card red">
              <div className="stat-value">{loading ? '—' : overdueCount}</div>
              <div className="stat-label">Overdue Issues</div>
            </div>
            <div className="stat-card green">
              <div className="stat-value">{loading ? '—' : `₹${totalFines.toFixed(0)}`}</div>
              <div className="stat-label">Total Fines</div>
            </div>
          </div>

          {pendingFines.length > 0 && (
            <div className="pending-fines-banner">
              <span>⚠️ <strong>{pendingFines.length}</strong> issue(s) have unpaid fines totalling <strong>₹{pendingFines.reduce((s, i) => s + (i.fineAmount || 0), 0).toFixed(2)}</strong></span>
              <button className="btn btn-primary btn-sm" onClick={() => setTab('issues')}>View Issues →</button>
            </div>
          )}

          <div className="table-container">
            <div className="table-header"><div className="table-title">Recent Issues</div></div>
            {loading ? <div className="loading">Loading</div> : issues.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">◎</div><p>No issues yet</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>ID</th><th>Book</th><th>Student</th><th>Issued</th><th>Due Date</th><th>Fine</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {issues.slice(-6).reverse().map(i => (
                    <tr key={i.bookIssueId}>
                      <td>#{i.bookIssueId}</td>
                      <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.book?.title || '—'}</td>
                      <td>{i.user?.name || i.user?.username || '—'}</td>
                      <td>{i.issueDate}</td>
                      <td style={{ color: i.status === 'OVERDUE' ? 'var(--error)' : 'inherit' }}>{i.dueDate?.split('T')[0] || '—'}</td>
                      <td>{i.fineAmount > 0 ? <span className="fine-amount">₹{i.fineAmount}</span> : '—'}</td>
                      <td>{statusBadge(i.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── BOOK STOCK ────────────────────────────────────────────────────── */}
      {tab === 'books' && (
        <div>
          <div className="page-header">
            <div className="page-title">Book <span>Stock</span></div>
            <div className="page-subtitle">
              Complete inventory — {books.length} books · {books.reduce((s, b) => s + (b.availableQuantity || 0), 0)} available
            </div>
          </div>
          <div className="table-container">
            <div className="table-header">
              <div className="table-title">All Books</div>
              <div className="filter-bar">
                <input placeholder="Search title, author, subject..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} />
                <button className="btn btn-primary" onClick={openAddBook}>+ Add Book</button>
              </div>
            </div>
            {loading ? <div className="loading">Loading</div> : filteredBooks.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">◉</div><p>No books found</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Author</th><th>Subject</th><th>Total</th><th>Available</th><th>Status</th><th>Added By</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredBooks.map(b => (
                    <tr key={b.bookId}>
                      <td>#{b.bookId}</td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</td>
                      <td>{b.author || '—'}</td>
                      <td>{b.subject || '—'}</td>
                      <td>{b.totalQuantity}</td>
                      <td>
                        <span style={{ color: b.availableQuantity === 0 ? 'var(--error)' : b.availableQuantity < 3 ? 'var(--warning)' : 'var(--success)' }}>
                          {b.availableQuantity}
                        </span>
                      </td>
                      <td><span className={`badge badge-${(b.status || 'active').toLowerCase()}`}>{b.status || 'ACTIVE'}</span></td>
                      <td>{b.user?.name || b.user?.username || '—'}</td>
                      <td>
                        <div className="action-cell">
                          <button className="btn btn-edit" onClick={() => openEditBook(b)}>Edit</button>
                          <button className="btn btn-danger" onClick={() => deleteBook(b.bookId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── USERS ─────────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div>
          <div className="page-header">
            <div className="page-title">User <span>Management</span></div>
            <div className="page-subtitle">{users.length} registered users</div>
          </div>
          <div className="table-container">
            <div className="table-header">
              <div className="table-title">All Users</div>
              <div className="filter-bar">
                <input placeholder="Search name, username, role..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                <button className="btn btn-primary" onClick={openAddUser}>+ Add User</button>
              </div>
            </div>
            {loading ? <div className="loading">Loading</div> : filteredUsers.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">◈</div><p>No users found</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Username</th><th>Role</th><th>Contact</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.userId}>
                      <td>#{u.userId}</td>
                      <td>{u.name || '—'}</td>
                      <td>{u.username}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td>{u.contact || '—'}</td>
                      <td>
                        <div className="action-cell">
                          <button className="btn btn-edit" onClick={() => openEditUser(u)}>Edit</button>
                          <button className="btn btn-danger" onClick={() => deleteUser(u.userId)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── ISSUES & FINES ────────────────────────────────────────────────── */}
      {tab === 'issues' && (
        <div>
          <div className="page-header">
            <div className="page-title">Issues <span>&amp; Fines</span></div>
            <div className="page-subtitle">Review student requests · set fines for overdue, lost, or torn books</div>
          </div>

          <div className="fine-info-bar">
            <div className="fine-info-item"><span className="fine-info-icon">📅</span><span>Overdue: <strong>₹{FINE_RATES.PER_DAY_OVERDUE}/day</strong></span></div>
            <div className="fine-info-item"><span className="fine-info-icon">🚫</span><span>Lost: <strong>₹{FINE_RATES.LOST_BOOK_FLAT} flat</strong></span></div>
            <div className="fine-info-item"><span className="fine-info-icon">📄</span><span>Torn: <strong>₹{FINE_RATES.TORN_BOOK_FLAT} flat</strong></span></div>
            <div className="fine-info-sep" />
            <div className="fine-info-item accent"><span>Total Fines: <strong>₹{totalFines.toFixed(2)}</strong></span></div>
            <div className="fine-info-item warn"><span>Overdue: <strong>{overdueCount}</strong></span></div>
          </div>

          <div className="table-container">
            <div className="table-header">
              <div className="table-title">All Issues</div>
              <div className="filter-bar">
                <select value={issueFilter} onChange={e => setIssueFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option>ISSUED</option>
                  <option>RETURNED</option>
                  <option>OVERDUE</option>
                  <option>LOST</option>
                  <option>TORN</option>
                </select>
              </div>
            </div>
            {loading ? <div className="loading">Loading</div> : filteredIssues.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">◎</div><p>No issues found</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>ID</th><th>Book</th><th>Student</th><th>Issued</th><th>Due Date</th><th>Return Date</th><th>Fine</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredIssues.map(iss => {
                    const { overdueDays } = fineUtils.calcOverdueFine(iss.dueDate, iss.returnDate || null);
                    return (
                      <tr key={iss.bookIssueId}>
                        <td>#{iss.bookIssueId}</td>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iss.book?.title || '—'}</td>
                        <td>{iss.user?.name || iss.user?.username || '—'}</td>
                        <td>{iss.issueDate}</td>
                        <td>
                          <span style={{ color: overdueDays > 0 && iss.status !== 'RETURNED' ? 'var(--error)' : 'inherit' }}>
                            {iss.dueDate?.split('T')[0] || '—'}
                          </span>
                        </td>
                        <td>{iss.returnDate || '—'}</td>
                        <td>{iss.fineAmount > 0 ? <span className="fine-amount">₹{Number(iss.fineAmount).toFixed(2)}</span> : <span style={{ color: 'var(--text-dim)' }}>₹0</span>}</td>
                        <td>{statusBadge(iss.status)}</td>
                        <td>
                          {iss.status !== 'RETURNED' ? (
                            <button className="btn btn-edit" onClick={() => openFineModal(iss)}>⚖️ Manage</button>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Closed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ─────────────────────────────────────────────────── */}
      {tab === 'notifications' && (
        <div>
          <div className="page-header">
            <div className="page-title">Notification <span>Center</span></div>
            <div className="page-subtitle">Send alerts to students about fines or overdue books</div>
          </div>
          <div className="table-container">
            <div className="table-header">
              <div className="table-title">All Notifications</div>
              <button className="btn btn-primary" onClick={() => { setNotifyForm({ message: '', sentAt: today, user: '', bookIssue: '' }); setError(''); setNotifyModal(true); }}>
                + Send Notification
              </button>
            </div>
            {loading ? <div className="loading">Loading</div> : notifications.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">◌</div><p>No notifications sent yet</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>ID</th><th>Message</th><th>User</th><th>Issue Ref</th><th>Sent At</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {notifications.map(n => (
                    <tr key={n.id}>
                      <td>#{n.id}</td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</td>
                      <td>{n.user?.name || n.user?.username || '—'}</td>
                      <td>{n.bookIssue ? <span className="badge badge-issued">Issue #{n.bookIssue.bookIssueId}</span> : '—'}</td>
                      <td>{n.sentAt}</td>
                      <td>
                        <button className="btn btn-danger" onClick={() => deleteNotify(n.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Book Modal */}
      {bookModal && (
        <Modal
          title={editingBook ? 'Edit Book' : 'Add Book'}
          onClose={() => setBookModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setBookModal(false)}>Cancel</button>
              <button className="btn btn-primary" form="book-form" type="submit">{editingBook ? 'Update Book' : 'Add Book'}</button>
            </>
          }
        >
          {error && <div className="alert alert-error">{error}</div>}
          <form id="book-form" onSubmit={submitBook}>
            <div className="form-grid">
              <div className="form-group full">
                <label>Title *</label>
                <input required value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} placeholder="Book title" />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} placeholder="Author name" />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input value={bookForm.subject} onChange={e => setBookForm({ ...bookForm, subject: e.target.value })} placeholder="Science, Fiction..." />
              </div>
              <div className="form-group">
                <label>Total Quantity *</label>
                <input required type="number" min="1" value={bookForm.totalQuantity} onChange={e => setBookForm({ ...bookForm, totalQuantity: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Available Quantity *</label>
                <input required type="number" min="0" value={bookForm.availableQuantity} onChange={e => setBookForm({ ...bookForm, availableQuantity: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={bookForm.status} onChange={e => setBookForm({ ...bookForm, status: e.target.value })}>
                  <option>ACTIVE</option>
                  <option>INACTIVE</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* User Modal */}
      {userModal && (
        <Modal
          title={editingUser ? 'Edit User' : 'Add User'}
          onClose={() => setUserModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setUserModal(false)}>Cancel</button>
              <button className="btn btn-primary" form="user-form" type="submit">{editingUser ? 'Update User' : 'Create User'}</button>
            </>
          }
        >
          {error && <div className="alert alert-error">{error}</div>}
          <form id="user-form" onSubmit={submitUser}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Username *</label>
                <input required value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} placeholder="johndoe" />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input required type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                  <option>ADMIN</option>
                  <option>LIBRARIAN</option>
                  <option>MEMBER</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contact</label>
                <input type="number" value={userForm.contact} onChange={e => setUserForm({ ...userForm, contact: e.target.value })} placeholder="9876543210" />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Fine / Issue Modal */}
      {fineModal && selectedIssue && (
        <Modal
          title="⚖️ Manage Issue & Fine"
          onClose={() => setFineModal(false)}
          wide
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setFineModal(false)}>Cancel</button>
              <button className="btn btn-primary" form="fine-form" type="submit">Save &amp; Notify Student</button>
            </>
          }
        >
          {error && <div className="alert alert-error">{error}</div>}

          <div className="fine-issue-info">
            <div><span className="fine-label">Book</span><span className="fine-val">{selectedIssue.book?.title}</span></div>
            <div><span className="fine-label">Student</span><span className="fine-val">{selectedIssue.user?.name || selectedIssue.user?.username}</span></div>
            <div><span className="fine-label">Issued On</span><span className="fine-val">{selectedIssue.issueDate}</span></div>
            <div><span className="fine-label">Due Date</span><span className="fine-val" style={{ color: 'var(--error)' }}>{selectedIssue.dueDate?.split('T')[0]}</span></div>
          </div>

          <form id="fine-form" onSubmit={submitFine}>
            <div className="form-grid" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>Return Date</label>
                <input type="date" value={fineForm.returnDate} onChange={e => setFineForm({ ...fineForm, returnDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={fineForm.status} onChange={e => {
                  const s = e.target.value;
                  let c = fineForm.condition;
                  if (s === 'LOST') c = 'LOST';
                  else if (s === 'TORN') c = 'TORN';
                  else if (c === 'LOST' || c === 'TORN') c = 'GOOD';
                  setFineForm({ ...fineForm, status: s, condition: c });
                }}>
                  <option>ISSUED</option>
                  <option>RETURNED</option>
                  <option>OVERDUE</option>
                  <option>LOST</option>
                  <option>TORN</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                Book Condition
              </label>
              <div className="condition-cards">
                {[
                  { val: 'GOOD', icon: '📗', label: 'Good',    desc: 'No damage',       fine: 'No extra fine' },
                  { val: 'TORN', icon: '📄', label: 'Damaged', desc: 'Torn or stained',  fine: `₹${FINE_RATES.TORN_BOOK_FLAT} penalty` },
                  { val: 'LOST', icon: '🚫', label: 'Lost',    desc: 'Book is missing',  fine: `₹${FINE_RATES.LOST_BOOK_FLAT} penalty` },
                ].map(c => (
                  <button type="button" key={c.val} className={`condition-card ${fineForm.condition === c.val ? 'selected' : ''}`} onClick={() => handleCondChange(c.val)}>
                    <div className="condition-icon">{c.icon}</div>
                    <div className="condition-label">{c.label}</div>
                    <div className="condition-desc">{c.desc}</div>
                    <div className={`condition-fine ${c.val !== 'GOOD' ? 'has-fine' : ''}`}>{c.fine}</div>
                    {fineForm.condition === c.val && <div className="condition-check">✓</div>}
                  </button>
                ))}
              </div>
            </div>

            {finePreview && (
              <div className={`fine-preview ${finePreview.totalFine > 0 ? 'has-fine' : 'no-fine'}`} style={{ marginTop: '16px' }}>
                <div className="fine-preview-title">{finePreview.totalFine > 0 ? '⚠️ Fine Breakdown' : '✅ No Fine'}</div>
                {finePreview.breakdown.length > 0
                  ? finePreview.breakdown.map((line, i) => (
                      <div key={i} className={`fine-line ${line.startsWith('Total') ? 'fine-total-line' : ''}`}>{line}</div>
                    ))
                  : <div className="fine-line">No fine applicable.</div>
                }
              </div>
            )}

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Fine Amount ₹ (auto-calculated · manually editable)</label>
              <input
                type="number" min="0" step="0.01"
                value={fineForm.fineAmount}
                onChange={e => setFineForm({ ...fineForm, fineAmount: e.target.value })}
                style={{ borderColor: fineForm.fineAmount > 0 ? 'var(--error)' : undefined }}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Notify Modal */}
      {notifyModal && (
        <Modal
          title="Send Notification"
          onClose={() => setNotifyModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setNotifyModal(false)}>Cancel</button>
              <button className="btn btn-primary" form="notify-form" type="submit">Send</button>
            </>
          }
        >
          {error && <div className="alert alert-error">{error}</div>}
          <form id="notify-form" onSubmit={submitNotify}>
            <div className="form-grid">
              <div className="form-group full">
                <label>Message *</label>
                <textarea required rows={3} value={notifyForm.message} onChange={e => setNotifyForm({ ...notifyForm, message: e.target.value })} placeholder="Your book is overdue. Please return it..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label>User *</label>
                <select required value={notifyForm.user} onChange={e => setNotifyForm({ ...notifyForm, user: e.target.value })}>
                  <option value="">Select user</option>
                  {users.map(u => <option key={u.userId} value={u.userId}>{u.name || u.username}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Issue Reference *</label>
                <select required value={notifyForm.bookIssue} onChange={e => setNotifyForm({ ...notifyForm, bookIssue: e.target.value })}>
                  <option value="">Select issue</option>
                  {issues.map(i => <option key={i.bookIssueId} value={i.bookIssueId}>#{i.bookIssueId} – {i.book?.title || 'Book'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input required type="date" value={notifyForm.sentAt} onChange={e => setNotifyForm({ ...notifyForm, sentAt: e.target.value })} />
              </div>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
