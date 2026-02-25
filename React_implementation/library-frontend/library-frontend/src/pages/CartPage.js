import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function CartPage({ onNavigate }) {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [returnDate, setReturnDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleIssue = async () => {
    if (!returnDate) { addToast('Please select a return date.', 'error'); return; }
    if (cart.length === 0) { addToast('Cart is empty.', 'error'); return; }
    setLoading(true);
    try {
      for (const book of cart) {
        await issueAPI.create({
          user: { userId: user.userId },
          book: { bookId: book.bookId },
          issueDate: today,
          dueDate: `${returnDate}T00:00:00`,
          status: 'ISSUED',
        });
      }
      clearCart();
      setSuccess(true);
      addToast('Books issued successfully!', 'success');
    } catch (err) {
      addToast('Failed to issue books. Please try again.', 'error');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Books Issued Successfully!
          </h2>
          <p style={{ color: 'var(--slate)', marginBottom: '2rem' }}>
            Your books have been issued. Please return them by the due date to avoid fines.
            Happy reading!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('my-issues')}>View My Issues</button>
            <button className="btn btn-outline" onClick={() => { setSuccess(false); onNavigate('search'); }}>Browse More</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Cart</h1>
          <p className="page-subtitle">{cart.length} book{cart.length !== 1 ? 's' : ''} selected</p>
        </div>
        <button className="btn btn-outline" onClick={() => onNavigate('search')}>← Continue Browsing</button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p style={{ marginBottom: '1.5rem' }}>Browse and add books to get started</p>
          <button className="btn btn-amber" onClick={() => onNavigate('search')}>Browse Books</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Cart items */}
          <div className="card">
            {cart.map((book, idx) => (
              <div key={book.bookId} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.25rem 1.5rem',
                borderBottom: idx < cart.length - 1 ? '1px solid var(--border)' : 'none',
                animation: `fadeIn 0.3s ease ${idx * 0.05}s both`
              }}>
                <div style={{ width: 44, height: 58, background: 'var(--amber-pale)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid var(--border)', flexShrink: 0 }}>📖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{book.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate)', marginTop: '0.2rem' }}>by {book.author || 'Unknown'}</div>
                  {book.subject && <span className="badge badge-blue" style={{ marginTop: '0.35rem', fontSize: '0.7rem' }}>{book.subject}</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge badge-green" style={{ marginBottom: '0.5rem' }}>Available</div>
                  <br />
                  <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(book.bookId)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Issue form */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Issue Books</h3>
            <div className="form-group">
              <label className="form-label">Return Date *</label>
              <input
                type="date"
                className="input-field"
                min={today}
                max={maxDateStr}
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.375rem' }}>
                Maximum 30 days from today
              </div>
            </div>

            <div style={{ background: 'var(--amber-pale)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>⚠ Fine Policy</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
                Late returns may incur fines as determined by the librarian. Lost books will be charged accordingly.
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--slate)', marginBottom: '0.375rem' }}>
                <span>Books selected</span>
                <span>{cart.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Requesting as</span>
                <span>{user.name || user.username}</span>
              </div>
            </div>

            <button className="btn btn-amber btn-lg w-full" onClick={handleIssue} disabled={loading || !returnDate}>
              {loading ? 'Processing...' : `Issue ${cart.length} Book${cart.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
