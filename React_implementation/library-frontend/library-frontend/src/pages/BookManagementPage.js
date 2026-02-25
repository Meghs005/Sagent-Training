import React, { useEffect, useState } from 'react';
import { stockAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const emptyBook = { title: '', author: '', subject: '', totalQuantity: 1, availableQuantity: 1, status: 'AVAILABLE' };

export default function BookManagementPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyBook);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    stockAPI.getAll().then(r => setBooks(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = books.filter(b =>
    !search || b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyBook); setModal('add'); };
  const openEdit = (book) => { setForm({ ...book, userId: book.user?.userId }); setModal('edit'); };

  const handleSave = async () => {
    if (!form.title) { addToast('Title is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, user: { userId: user.userId } };
      if (modal === 'add') {
        await stockAPI.create(payload);
        addToast('Book added!', 'success');
      } else {
        await stockAPI.update(form.bookId, payload);
        addToast('Book updated!', 'success');
      }
      setModal(null);
      load();
    } catch { addToast('Failed to save book.', 'error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    setDeletingId(id);
    try {
      await stockAPI.delete(id);
      addToast('Book deleted.', 'success');
      load();
    } catch { addToast('Failed to delete.', 'error'); }
    setDeletingId(null);
  };

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Book Inventory</h1>
          <p className="page-subtitle">{books.length} books in collection</p>
        </div>
        <button className="btn btn-amber" onClick={openAdd}>+ Add Book</button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input className="input-field" style={{ maxWidth: 360 }}
          placeholder="Search books..."
          value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Subject</th>
                <th>Total</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--slate)', padding: '3rem' }}>No books found</td></tr>
              ) : filtered.map(book => (
                <tr key={book.bookId}>
                  <td style={{ fontWeight: 500 }}>{book.title}</td>
                  <td>{book.author || '—'}</td>
                  <td>{book.subject ? <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>{book.subject}</span> : '—'}</td>
                  <td>{book.totalQuantity}</td>
                  <td>
                    <span style={{ color: book.availableQuantity > 0 ? 'var(--forest)' : 'var(--crimson)', fontWeight: 600 }}>
                      {book.availableQuantity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${book.availableQuantity > 0 ? 'badge-green' : 'badge-red'}`}>
                      {book.availableQuantity > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(book)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book.bookId)}
                        disabled={deletingId === book.bookId}>
                        {deletingId === book.bookId ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'add' ? 'Add New Book' : 'Edit Book'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="Book title" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Author</label>
                <input name="author" value={form.author || ''} onChange={handleChange} className="input-field" placeholder="Author name" />
              </div>
              <div className="form-group">
                <label className="form-label">Subject / Genre</label>
                <input name="subject" value={form.subject || ''} onChange={handleChange} className="input-field" placeholder="e.g. Fiction, Science" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Quantity</label>
                <input name="totalQuantity" type="number" min={1} value={form.totalQuantity} onChange={handleChange} className="input-field" />
              </div>
              <div className="form-group">
                <label className="form-label">Available Quantity</label>
                <input name="availableQuantity" type="number" min={0} max={form.totalQuantity} value={form.availableQuantity} onChange={handleChange} className="input-field" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={form.status || 'AVAILABLE'} onChange={handleChange} className="input-field">
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setModal(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-amber" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving...' : 'Save Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
