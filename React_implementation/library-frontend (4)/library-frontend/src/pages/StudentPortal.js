import React, { useEffect, useState } from 'react';
import { bookApi, issueApi } from '../api/api';
import './StudentPortal.css';

const today = new Date().toISOString().split('T')[0];

export default function StudentPortal({ currentUser }) {
  const [books, setBooks]         = useState([]);
  const [myIssues, setMyIssues]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [cart, setCart]           = useState([]);
  const [cartOpen, setCartOpen]   = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError]         = useState('');
  const [tab, setTab]             = useState('browse');

  // Payment flow states
  const [checkoutModal, setCheckoutModal] = useState(false); // cart → payment
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentStep, setPaymentStep] = useState('review'); // 'review' | 'pay' | 'done'
  const [submitting, setSubmitting] = useState(false);

  // Fine payment states
  const [finePayModal, setFinePayModal] = useState(false);
  const [payingIssue, setPayingIssue]   = useState(null);
  const [fineMethod, setFineMethod]     = useState('');
  const [fineStep, setFineStep]         = useState('review'); // 'review' | 'done'

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, iRes] = await Promise.all([bookApi.getAll(), issueApi.getAll()]);
      setBooks(bRes.data.filter(b => b.availableQuantity > 0));
      setMyIssues(iRes.data.filter(i => i.user?.userId === currentUser.userId));
    } catch { setError('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = books.filter(b =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const inCart       = (bookId) => cart.some(c => c.book.bookId === bookId);
  const alreadyIssued = (bookId) => myIssues.some(i => i.book?.bookId === bookId && i.status !== 'RETURNED');

  const addToCart = (book) => {
    if (inCart(book.bookId) || alreadyIssued(book.bookId)) return;
    const defaultReturn = new Date();
    defaultReturn.setDate(defaultReturn.getDate() + 14);
    setCart(prev => [...prev, { book, returnDate: defaultReturn.toISOString().split('T')[0] }]);
    setSuccessMsg(`"${book.title}" added to cart!`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const removeFromCart    = (bookId) => setCart(prev => prev.filter(c => c.book.bookId !== bookId));
  const updateReturnDate  = (bookId, date) =>
    setCart(prev => prev.map(c => c.book.bookId === bookId ? { ...c, returnDate: date } : c));

  // Open checkout (cart → payment flow)
  const openCheckout = () => {
    setSelectedMethod('');
    setPaymentStep('review');
    setError('');
    setCartOpen(false);
    setCheckoutModal(true);
  };

  // Confirm payment → create issues in backend
  const confirmCheckout = async () => {
    if (!selectedMethod) { setError('Please select a payment method.'); return; }
    setSubmitting(true);
    setError('');
    try {
      for (const item of cart) {
        await issueApi.create({
          user:        { userId: currentUser.userId },
          book:        { bookId: item.book.bookId },
          issueDate:   today,
          dueDate:     item.returnDate + 'T23:59:00',
          returnDate:  null,
          fineAmount:  0,
          status:      'ISSUED',
        });
      }
      setPaymentStep('done');
      setCart([]);
      load();
    } catch (err) {
      setError('Payment processed but booking failed. Please contact the librarian.');
    } finally { setSubmitting(false); }
  };

  const closeCheckout = () => {
    setCheckoutModal(false);
    if (paymentStep === 'done') { setTab('mybooks'); }
  };

  // Fine payment
  const openFinePayment = (issue) => {
    setPayingIssue(issue);
    setFineMethod('');
    setFineStep('review');
    setFinePayModal(true);
  };

  const confirmFinePay = async () => {
    if (!fineMethod) { setError('Please select a payment method.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await issueApi.update(payingIssue.bookIssueId, {
        issueDate:   payingIssue.issueDate,
        dueDate:     payingIssue.dueDate,
        returnDate:  payingIssue.returnDate || today,
        fineAmount:  0,
        status:      'RETURNED',
        user:        { userId: payingIssue.user?.userId },
        book:        { bookId: payingIssue.book?.bookId },
      });
      setFineStep('done');
      load();
    } catch { setError('Payment failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const statusBadge = (s) => {
    const map = { ISSUED:'badge-issued', RETURNED:'badge-returned', OVERDUE:'badge-overdue', LOST:'badge-lost', TORN:'badge-torn' };
    return <span className={`badge ${map[s]||'badge-issued'}`}>{s}</span>;
  };

  const minReturnDate = (() => { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; })();

  const PAY_METHODS = ['💳 Card', '📱 UPI', '🏦 Net Banking', '💵 Cash'];

  return (
    <div className="student-shell">
      {/* Header */}
      <div className="student-header">
        <div>
          <div className="page-title">Welcome, <span>{currentUser.name || currentUser.username}</span> 👋</div>
          <div className="page-subtitle">Browse books, add to cart, and track your borrowed books</div>
        </div>
        <button className="cart-btn" onClick={() => setCartOpen(true)}>
          🛒 Cart
          {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
        </button>
      </div>

      {/* Tabs */}
      <div className="student-tabs">
        <button className={`s-tab ${tab==='browse'?'active':''}`} onClick={() => setTab('browse')}>📚 Browse Books</button>
        <button className={`s-tab ${tab==='mybooks'?'active':''}`} onClick={() => setTab('mybooks')}>
          📖 My Books
          {myIssues.filter(i => i.status !== 'RETURNED').length > 0 &&
            <span className="tab-count">{myIssues.filter(i=>i.status!=='RETURNED').length}</span>}
        </button>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {error && !checkoutModal && !finePayModal && <div className="alert alert-error">{error}</div>}

      {/* ── BROWSE TAB ── */}
      {tab === 'browse' && (
        <div>
          <div className="search-bar-wrap">
            <span className="search-icon">🔍</span>
            <input className="student-search" placeholder="Search by title, author, or subject..."
              value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>

          {loading ? <div className="loading">Loading books</div> : (
            <div className="books-grid">
              {filtered.length === 0 ? (
                <div className="empty-state" style={{gridColumn:'1/-1'}}>
                  <div className="empty-state-icon">📭</div>
                  <p>No books found{search ? ` for "${search}"` : ''}</p>
                </div>
              ) : filtered.map(b => (
                <div key={b.bookId} className={`book-card ${alreadyIssued(b.bookId)?'already-issued':''} ${inCart(b.bookId)?'in-cart':''}`}>
                  <div className="book-card-subject">{b.subject || 'General'}</div>
                  <div className="book-card-title">{b.title}</div>
                  <div className="book-card-author">by {b.author || 'Unknown'}</div>
                  <div className="book-card-avail">
                    <span style={{color:b.availableQuantity>3?'var(--success)':'var(--warning)'}}>
                      {b.availableQuantity} available
                    </span>
                  </div>
                  <button
                    className={`book-card-btn ${inCart(b.bookId)?'incart':''} ${alreadyIssued(b.bookId)?'issued':''}`}
                    onClick={() => addToCart(b)}
                    disabled={inCart(b.bookId) || alreadyIssued(b.bookId)}
                  >
                    {alreadyIssued(b.bookId) ? '✓ Already Borrowed' : inCart(b.bookId) ? '✓ In Cart' : '+ Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MY BOOKS TAB ── */}
      {tab === 'mybooks' && (
        <div className="table-container">
          <div className="table-header"><div className="table-title">My Borrowed Books</div></div>
          {loading ? <div className="loading">Loading</div> : myIssues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📖</div>
              <p>You haven't borrowed any books yet.</p>
              <button className="btn btn-primary" style={{marginTop:'12px'}} onClick={() => setTab('browse')}>Browse Books</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Book</th><th>Issue Date</th><th>Return By</th><th>Returned On</th><th>Status</th><th>Fine (₹)</th><th>Action</th></tr>
              </thead>
              <tbody>
                {myIssues.map(iss => (
                  <tr key={iss.bookIssueId}>
                    <td><strong>{iss.book?.title || '—'}</strong></td>
                    <td>{iss.issueDate}</td>
                    <td><span style={{color:iss.status==='OVERDUE'?'var(--error)':'inherit'}}>{iss.dueDate?.split('T')[0]||'—'}</span></td>
                    <td>{iss.returnDate || '—'}</td>
                    <td>{statusBadge(iss.status)}</td>
                    <td>{iss.fineAmount>0 ? <span className="fine-amount">₹{Number(iss.fineAmount).toFixed(2)}</span> : <span style={{color:'var(--text-dim)'}}>₹0</span>}</td>
                    <td>
                      {iss.fineAmount > 0 && iss.status !== 'RETURNED' ? (
                        <button className="btn btn-primary btn-sm" onClick={() => openFinePayment(iss)}>💳 Pay Fine</button>
                      ) : iss.status === 'RETURNED' ? (
                        <span style={{color:'var(--success)',fontSize:'11px'}}>✓ Returned</span>
                      ) : (
                        <span style={{color:'var(--text-dim)',fontSize:'11px'}}>Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── CART MODAL ── */}
      {cartOpen && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setCartOpen(false)}>
          <div className="modal modal-wide">
            <div className="modal-header">
              <div className="modal-title">🛒 Your Cart ({cart.length} book{cart.length!==1?'s':''})</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {cart.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🛒</div>
                  <p>Your cart is empty. Browse and add books!</p>
                </div>
              ) : (
                <div className="cart-list">
                  {cart.map(item => (
                    <div key={item.book.bookId} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-title">{item.book.title}</div>
                        <div className="cart-item-author">by {item.book.author || 'Unknown'}</div>
                      </div>
                      <div className="cart-item-date">
                        <label>Return by</label>
                        <input type="date" min={minReturnDate} value={item.returnDate}
                          onChange={e => updateReturnDate(item.book.bookId, e.target.value)} />
                      </div>
                      <button className="btn btn-danger" onClick={() => removeFromCart(item.book.bookId)}>✕</button>
                    </div>
                  ))}
                  <div className="cart-note">
                    ⚠️ Fine of ₹5/day for late returns · Lost books: ₹500 · Torn/damaged: ₹200
                  </div>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setCartOpen(false)}>Continue Browsing</button>
                <button className="btn btn-primary" onClick={openCheckout}>
                  Proceed to Payment →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHECKOUT / PAYMENT MODAL ── */}
      {checkoutModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&paymentStep==='review'&&setCheckoutModal(false)}>
          <div className="modal modal-wide">
            {paymentStep !== 'done' && (
              <div className="modal-header">
                <div className="modal-title">
                  {paymentStep==='review' ? '🧾 Order Summary' : '💳 Payment'}
                </div>
                {paymentStep === 'review' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setCheckoutModal(false)}>✕</button>
                )}
              </div>
            )}

            <div className="modal-body">
              {/* Step: review */}
              {paymentStep === 'review' && (
                <div>
                  <div className="checkout-steps">
                    <div className="checkout-step active">1. Review</div>
                    <div className="checkout-step-arrow">→</div>
                    <div className="checkout-step">2. Payment</div>
                    <div className="checkout-step-arrow">→</div>
                    <div className="checkout-step">3. Confirm</div>
                  </div>
                  <div className="checkout-books">
                    {cart.map(item => (
                      <div key={item.book.bookId} className="checkout-book-row">
                        <div>
                          <div className="checkout-book-title">{item.book.title}</div>
                          <div className="checkout-book-author">by {item.book.author || 'Unknown'}</div>
                        </div>
                        <div className="checkout-return-date">
                          <span>Return by</span>
                          <strong>{item.returnDate}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="checkout-summary">
                    <div className="checkout-summary-row"><span>Books requested</span><span>{cart.length}</span></div>
                    <div className="checkout-summary-row"><span>Borrowing fee</span><span style={{color:'var(--success)'}}>Free</span></div>
                    <div className="checkout-summary-row warn"><span>Late fine (if applicable)</span><span>₹5/day</span></div>
                  </div>
                </div>
              )}

              {/* Step: pay */}
              {paymentStep === 'pay' && (
                <div>
                  <div className="checkout-steps">
                    <div className="checkout-step done">1. Review ✓</div>
                    <div className="checkout-step-arrow">→</div>
                    <div className="checkout-step active">2. Payment</div>
                    <div className="checkout-step-arrow">→</div>
                    <div className="checkout-step">3. Confirm</div>
                  </div>
                  <div className="pay-section-label">Select payment method</div>
                  <div className="pay-methods-grid">
                    {PAY_METHODS.map(m => (
                      <div key={m} className={`pay-method ${selectedMethod===m?'selected':''}`} onClick={() => setSelectedMethod(m)}>
                        {m}
                        {selectedMethod===m && <div className="pay-check">✓</div>}
                      </div>
                    ))}
                  </div>
                  {error && <div className="alert alert-error" style={{marginTop:'12px'}}>{error}</div>}
                  <div className="checkout-summary" style={{marginTop:'16px'}}>
                    <div className="checkout-summary-row total"><span>Amount Due Now</span><span style={{color:'var(--success)'}}>₹0 (Free)</span></div>
                    <div style={{fontSize:'11px',color:'var(--text-muted)',marginTop:'8px'}}>
                      Payment method is saved for any future fines on these books.
                    </div>
                  </div>
                </div>
              )}

              {/* Step: done */}
              {paymentStep === 'done' && (
                <div className="payment-success">
                  <div className="payment-success-icon">🎉</div>
                  <div className="payment-success-title">Booking Confirmed!</div>
                  <div className="payment-success-sub">
                    Your books have been issued successfully. Visit the library counter to collect them.
                  </div>
                  <div style={{marginTop:'16px',fontSize:'12px',color:'var(--text-muted)'}}>
                    Check <strong>"My Books"</strong> tab to see your issued books.
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {paymentStep === 'review' && (
                <>
                  <button className="btn btn-ghost" onClick={() => { setCheckoutModal(false); setCartOpen(true); }}>← Back to Cart</button>
                  <button className="btn btn-primary" onClick={() => { setError(''); setPaymentStep('pay'); }}>
                    Continue to Payment →
                  </button>
                </>
              )}
              {paymentStep === 'pay' && (
                <>
                  <button className="btn btn-ghost" onClick={() => setPaymentStep('review')}>← Back</button>
                  <button className="btn btn-primary" onClick={confirmCheckout} disabled={submitting || !selectedMethod}>
                    {submitting ? 'Confirming...' : `Confirm Booking`}
                  </button>
                </>
              )}
              {paymentStep === 'done' && (
                <button className="btn btn-primary" onClick={closeCheckout}>View My Books →</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FINE PAYMENT MODAL ── */}
      {finePayModal && payingIssue && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&fineStep!=='done'&&setFinePayModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">💳 Pay Fine</div>
              {fineStep !== 'done' && <button className="btn btn-ghost btn-sm" onClick={() => setFinePayModal(false)}>✕</button>}
            </div>
            <div className="modal-body">
              {fineStep === 'review' && (
                <div className="payment-detail">
                  <div className="payment-book">{payingIssue.book?.title}</div>
                  <div className="payment-rows">
                    <div className="payment-row"><span>Issue Date</span><span>{payingIssue.issueDate}</span></div>
                    <div className="payment-row"><span>Due Date</span><span>{payingIssue.dueDate?.split('T')[0]}</span></div>
                    <div className="payment-row"><span>Status</span><span>{statusBadge(payingIssue.status)}</span></div>
                    <div className="payment-row total"><span>Fine Amount</span><span className="fine-amount">₹{Number(payingIssue.fineAmount).toFixed(2)}</span></div>
                  </div>
                  <div className="payment-methods" style={{marginTop:'16px'}}>
                    <div className="pay-section-label">Select payment method</div>
                    <div className="pay-methods-grid">
                      {PAY_METHODS.map(m => (
                        <div key={m} className={`pay-method ${fineMethod===m?'selected':''}`} onClick={() => setFineMethod(m)}>
                          {m}
                          {fineMethod===m && <div className="pay-check">✓</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                  {error && <div className="alert alert-error" style={{marginTop:'12px'}}>{error}</div>}
                </div>
              )}
              {fineStep === 'done' && (
                <div className="payment-success">
                  <div className="payment-success-icon">✅</div>
                  <div className="payment-success-title">Payment Successful!</div>
                  <div className="payment-success-sub">Fine of ₹{Number(payingIssue.fineAmount).toFixed(2)} cleared. Book marked as returned.</div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {fineStep === 'review' && (
                <>
                  <button className="btn btn-ghost" onClick={() => setFinePayModal(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={confirmFinePay} disabled={submitting || !fineMethod}>
                    {submitting ? 'Processing...' : `Pay ₹${Number(payingIssue.fineAmount).toFixed(2)}`}
                  </button>
                </>
              )}
              {fineStep === 'done' && (
                <button className="btn btn-primary" onClick={() => setFinePayModal(false)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
