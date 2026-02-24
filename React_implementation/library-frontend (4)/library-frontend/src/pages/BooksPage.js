import React, { useEffect, useState } from 'react';
import { bookApi, userApi } from '../api/api';

const emptyBook = { title: '', author: '', subject: '', totalQuantity: 1, availableQuantity: 1, status: 'ACTIVE', user: null };

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([bookApi.getAll(), userApi.getAll()])
      .then(([b, u]) => { setBooks(b.data); setUsers(u.data); })
      .catch(() => setError('Failed to load books'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyBook, user: users[0] ? { userId: users[0].userId } : null });
    setModal(true); setError('');
  };

  const openEdit = (b) => {
    setEditing(b.bookId);
    setForm({ title: b.title, author: b.author || '', subject: b.subject || '', totalQuantity: b.totalQuantity, availableQuantity: b.availableQuantity, status: b.status || 'ACTIVE', user: b.user });
    setModal(true); setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, totalQuantity: Number(form.totalQuantity), availableQuantity: Number(form.availableQuantity) };
      if (editing) await bookApi.update(editing, payload);
      else await bookApi.create(payload);
      setModal(false); load();
    } catch { setError('Failed to save book'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try { await bookApi.delete(id); load(); } catch { setError('Failed to delete'); }
  };

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Book <span>Stock</span></div>
        <div className="page-subtitle">Manage library inventory and availability</div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <div className="table-header">
          <div className="table-title">All Books</div>
          <div className="filter-bar">
            <input placeholder="Search title, author, subject..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-primary" onClick={openCreate}>+ Add Book</button>
          </div>
        </div>
        {loading ? <div className="loading">Loading</div> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">◉</div><p>No books found</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Author</th><th>Subject</th><th>Total</th><th>Available</th><th>Status</th><th>Added By</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.bookId}>
                  <td>#{b.bookId}</td>
                  <td style={{maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{b.title}</td>
                  <td>{b.author || '—'}</td>
                  <td>{b.subject || '—'}</td>
                  <td>{b.totalQuantity}</td>
                  <td>
                    <span style={{ color: b.availableQuantity === 0 ? 'var(--error)' : b.availableQuantity < 3 ? 'var(--warning)' : 'var(--success)' }}>
                      {b.availableQuantity}
                    </span>
                  </td>
                  <td><span className={`badge badge-${b.status?.toLowerCase() || 'active'}`}>{b.status || 'ACTIVE'}</span></td>
                  <td>{b.user?.name || b.user?.username || '—'}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn btn-edit" onClick={() => openEdit(b)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => remove(b.bookId)}>Delete</button>
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
              <div className="modal-title">{editing ? 'Edit Book' : 'Add Book'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Title *</label>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Book title" />
                  </div>
                  <div className="form-group">
                    <label>Author</label>
                    <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Author name" />
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Science, Fiction" />
                  </div>
                  <div className="form-group">
                    <label>Total Qty *</label>
                    <input required type="number" min="1" value={form.totalQuantity} onChange={e => setForm({...form, totalQuantity: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Available Qty *</label>
                    <input required type="number" min="0" value={form.availableQuantity} onChange={e => setForm({...form, availableQuantity: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option>ACTIVE</option>
                      <option>INACTIVE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Added By (User) *</label>
                    <select required value={form.user?.userId || ''} onChange={e => setForm({...form, user: { userId: Number(e.target.value) }})}>
                      <option value="">Select user</option>
                      {users.map(u => <option key={u.userId} value={u.userId}>{u.name || u.username}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add Book'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
