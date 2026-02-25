import React, { useEffect, useState } from 'react';
import { stockAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export default function BookSearchPage({ onNavigate }) {
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    stockAPI.getAll().then(r => {
      setBooks(r.data);
      setFiltered(r.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = books;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b => {
        if (filterBy === 'author') return b.author?.toLowerCase().includes(q);
        if (filterBy === 'subject') return b.subject?.toLowerCase().includes(q);
        return (
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.subject?.toLowerCase().includes(q)
        );
      });
    }
    setFiltered(result);
  }, [search, filterBy, books]);

  const handleAddToCart = (book) => {
    if (book.availableQuantity <= 0) {
      addToast('This book is not available.', 'error');
      return;
    }
    if (cart.find(b => b.bookId === book.bookId)) {
      addToast('Already in cart!', 'warning');
      return;
    }
    addToCart(book);
    addToast(`"${book.title}" added to cart!`, 'success');
  };

  const subjects = [...new Set(books.map(b => b.subject).filter(Boolean))];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Books</h1>
          <p className="page-subtitle">{filtered.length} books available in our collection</p>
        </div>
        <div className="cart-btn" style={{ position: 'relative' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('cart')}>
            🛒 Cart
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)' }}>🔍</span>
          <input
            className="input-field"
            style={{ paddingLeft: '2.25rem' }}
            placeholder={`Search by ${filterBy === 'all' ? 'title, author, or subject' : filterBy}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field"
          style={{ width: 'auto', minWidth: 150 }}
          value={filterBy}
          onChange={e => setFilterBy(e.target.value)}
        >
          <option value="all">All Fields</option>
          <option value="author">By Author</option>
          <option value="subject">By Subject</option>
        </select>
      </div>

      {/* Subject tags */}
      {subjects.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--slate)', alignSelf: 'center' }}>Subjects:</span>
          {subjects.map(s => (
            <button key={s} onClick={() => { setFilterBy('subject'); setSearch(s); }}
              className="badge badge-amber" style={{ cursor: 'pointer', border: 'none' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No books found</h3>
          <p>Try a different search term</p>
        </div>
      ) : (
        <div className="books-grid">
          {filtered.map(book => {
            const inCart = cart.find(b => b.bookId === book.bookId);
            const available = book.availableQuantity > 0;
            return (
              <div key={book.bookId} className="book-card">
                <div className="book-cover">📖</div>
                <div className="book-title">{book.title}</div>
                <div className="book-author">by {book.author || 'Unknown'}</div>
                {book.subject && (
                  <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{book.subject}</span>
                )}
                <div className="book-meta">
                  <span className={`badge ${available ? 'badge-green' : 'badge-red'}`}>
                    {available ? `${book.availableQuantity} available` : 'Unavailable'}
                  </span>
                  <button
                    className={`btn btn-sm ${inCart ? 'btn-outline' : 'btn-amber'}`}
                    onClick={() => handleAddToCart(book)}
                    disabled={!available || !!inCart}
                  >
                    {inCart ? '✓ Added' : '+ Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
