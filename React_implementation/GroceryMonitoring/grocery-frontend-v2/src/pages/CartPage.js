import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addCart, addOrder, addPayment, getAllDiscounts, getAllOrders } from '../services/api';

const STEPS = ['Cart Review', 'Checkout', 'Payment', 'Confirmation'];

// ─── Discount Rule Engine ──────────────────────────────────────────────────
// Determines if a discount is ELIGIBLE for the current user + cart
// Rules based on discountOfferType naming conventions:
//   "NEWUSER"        → only if user has 0 previous orders
//   "AUTO X% OFF"    → auto-applied based on cart amount thresholds
//   "FESTIVAL OFFER" → always available (seasonal)
//   "SUPERSALE..."   → always available (sale)
//   any other code   → always available (manual coupon)

function classifyDiscount(discount, cartTotal, orderCount) {
  const type = (discount.discountOfferType || '').toUpperCase().trim();
  const pct  = discount.discountPercentage;

  // ── Rule 1: NEWUSER → only if this is first order
  if (type.includes('NEWUSER') || type.includes('NEW USER') || type.includes('NEW_USER')) {
    if (orderCount > 0) {
      return { eligible: false, reason: 'Only for first-time orders' };
    }
    return { eligible: true, tag: '🎁 New User', reason: 'Welcome offer for first order!' };
  }

  // ── Rule 2: AUTO discounts → applied automatically based on cart total
  if (type.startsWith('AUTO')) {
    // Extract threshold from name if present e.g. "AUTO 5.0% OFF" means auto
    // Apply based on percentage tiers: small % = low threshold, high % = high threshold
    if (pct >= 40) {
      if (cartTotal < 1000) return { eligible: false, reason: `Spend ₹${(1000 - cartTotal).toFixed(0)} more to unlock` };
      return { eligible: true, tag: '⚡ Auto', reason: 'Applied for orders above ₹1000', auto: true };
    }
    if (pct >= 20) {
      if (cartTotal < 500) return { eligible: false, reason: `Spend ₹${(500 - cartTotal).toFixed(0)} more to unlock` };
      return { eligible: true, tag: '⚡ Auto', reason: 'Applied for orders above ₹500', auto: true };
    }
    if (pct >= 10) {
      if (cartTotal < 200) return { eligible: false, reason: `Spend ₹${(200 - cartTotal).toFixed(0)} more to unlock` };
      return { eligible: true, tag: '⚡ Auto', reason: 'Applied for orders above ₹200', auto: true };
    }
    if (pct > 0) {
      if (cartTotal < 100) return { eligible: false, reason: `Spend ₹${(100 - cartTotal).toFixed(0)} more to unlock` };
      return { eligible: true, tag: '⚡ Auto', reason: 'Applied for orders above ₹100', auto: true };
    }
    // 0% discount — skip
    return { eligible: false, reason: 'Not applicable', hidden: true };
  }

  // ── Rule 3: Zero percentage discount → skip entirely
  if (pct === 0 || pct === null || pct === undefined) {
    return { eligible: false, reason: 'Not applicable', hidden: true };
  }

  // ── Rule 4: Festival / Seasonal → always available, manual apply
  if (type.includes('FESTIVAL') || type.includes('SEASON') || type.includes('DIWALI') || type.includes('ONAM')) {
    return { eligible: true, tag: '🎉 Seasonal', reason: 'Festival special offer' };
  }

  // ── Rule 5: Sale offers → always available
  if (type.includes('SALE') || type.includes('DEAL') || type.includes('OFFER')) {
    return { eligible: true, tag: '🏷 Sale', reason: 'Limited time sale' };
  }

  // ── Rule 6: Any other named coupon → always valid (manual entry)
  return { eligible: true, tag: '🎟 Coupon', reason: 'Apply this coupon code' };
}

// ─── Component ────────────────────────────────────────────────────────────
export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]               = useState(0);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [orderId, setOrderId]         = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');

  const [allDiscounts, setAllDiscounts]   = useState([]);
  const [userOrderCount, setUserOrderCount] = useState(0);
  const [showOffers, setShowOffers]       = useState(false);
  const [discountCode, setDiscountCode]   = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountMsg, setDiscountMsg]     = useState({ text: '', ok: false });

  // Load discounts + user's order count
  useEffect(() => {
    getAllDiscounts().then(r => setAllDiscounts(r.data)).catch(() => {});
    getAllOrders()
      .then(r => {
        const mine = r.data.filter(o => o.user?.userId === user?.userId);
        setUserOrderCount(mine.length);
      })
      .catch(() => {});
  }, [user]);

  // Enrich discounts with eligibility
  const enrichedDiscounts = allDiscounts
    .map(d => ({ ...d, ...classifyDiscount(d, cartTotal, userOrderCount) }))
    .filter(d => !d.hidden);

  const eligibleDiscounts   = enrichedDiscounts.filter(d => d.eligible);
  const ineligibleDiscounts = enrichedDiscounts.filter(d => !d.eligible);

  // Auto-apply best eligible AUTO discount (highest %)
  useEffect(() => {
    if (appliedDiscount) return; // don't override manual selection
    const autoDiscounts = eligibleDiscounts.filter(d => d.auto);
    if (autoDiscounts.length > 0) {
      const best = autoDiscounts.reduce((a, b) => a.discountPercentage > b.discountPercentage ? a : b);
      setAppliedDiscount(best);
      setDiscountMsg({ text: `⚡ "${best.discountOfferType}" auto-applied — ${best.discountPercentage}% off!`, ok: true });
    }
  }, [eligibleDiscounts.length, cartTotal]);

  const discountAmt = appliedDiscount ? (cartTotal * appliedDiscount.discountPercentage) / 100 : 0;
  const finalTotal  = Math.max(0, cartTotal - discountAmt);

  const applyCode = (code) => {
    const c = (code || discountCode).trim().toUpperCase();
    if (!c) { setDiscountMsg({ text: '⚠️ Please enter a discount code.', ok: false }); return; }

    const found = enrichedDiscounts.find(d => d.discountOfferType?.toUpperCase() === c);
    if (!found) {
      setAppliedDiscount(null);
      setDiscountMsg({ text: '❌ Invalid discount code. Check available offers below.', ok: false });
      return;
    }
    if (!found.eligible) {
      setAppliedDiscount(null);
      setDiscountMsg({ text: `❌ Not eligible: ${found.reason}`, ok: false });
      return;
    }
    setAppliedDiscount(found);
    setDiscountCode(found.discountOfferType);
    setDiscountMsg({ text: `✅ "${found.discountOfferType}" applied — ${found.discountPercentage}% off!`, ok: true });
    setShowOffers(false);
  };

  const handleOfferClick = (offer) => {
    if (!offer.eligible) return;
    setDiscountCode(offer.discountOfferType);
    setAppliedDiscount(offer);
    setDiscountMsg({ text: `✅ "${offer.discountOfferType}" applied — ${offer.discountPercentage}% off!`, ok: true });
    setShowOffers(false);
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountMsg({ text: '', ok: false });
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) { setError('Please enter a delivery address.'); return; }
    setLoading(true); setError('');
    try {
      const cartRes = await addCart({
        cartTotal: finalTotal,
        user: { userId: user.userId },
        ...(appliedDiscount ? { discount: { discountId: appliedDiscount.discountId } } : {}),
      });
      const orderRes = await addOrder({
        orderTotal: finalTotal,
        orderStatus: 'CONFIRMED',
        user: { userId: user.userId },
        cart: { cartId: cartRes.data.cartId },
      });
      setOrderId(orderRes.data.orderId);
      setStep(2);
    } catch { setError('Failed to place order. Please ensure the backend is running.'); }
    finally { setLoading(false); }
  };

  const handlePayment = async () => {
    setLoading(true); setError('');
    try {
      await addPayment({
        paymentMethod,
        paymentStatus: 'SUCCESS',
        paymentAmount: finalTotal,
        order: { orderId },
      });
      clearCart();
      setStep(3);
    } catch { setError('Payment failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const getEmoji = (cat) => {
    if (!cat) return '🛒';
    const k = cat.toLowerCase();
    if (k.includes('fruit')) return '🍎';
    if (k.includes('veg'))   return '🥦';
    if (k.includes('dairy')) return '🥛';
    if (k.includes('bakery'))return '🍞';
    return '🛒';
  };

  if (cartItems.length === 0 && step !== 3) return (
    <div className="page">
      <div className="empty-state">
        <div className="emo">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some fresh groceries to get started!</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">Complete your order in a few easy steps</p>
      </div>

      {/* Steps */}
      <div className="checkout-steps">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-circle">{i < step ? '✓' : i + 1}</div>
              <div className="step-label">{s}</div>
            </div>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* ── STEP 0: Cart Review ── */}
      {step === 0 && (
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-card">
            <div className="cart-card-header">
              <span className="cart-card-title">Your Items ({cartItems.length})</span>
              <button className="btn btn-ghost btn-sm"
                onClick={() => { if (window.confirm('Clear cart?')) clearCart(); }}>
                🗑 Clear
              </button>
            </div>
            {cartItems.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-icon">{getEmoji(item.productCategory)}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.productName}</div>
                  <div className="cart-item-unit">₹{item.productPrice?.toFixed(2)} each</div>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQty(item.productId, item.qty - 1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.productId, item.qty + 1)}>+</button>
                </div>
                <div className="cart-item-total">₹{(item.productPrice * item.qty).toFixed(2)}</div>
                <button className="del-btn" onClick={() => removeFromCart(item.productId)}>🗑</button>
              </div>
            ))}
          </div>

          {/* Summary Panel */}
          <div className="summary-panel">
            <div className="summary-header">
              <div className="summary-title">Order Summary</div>
              {userOrderCount === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'rgba(250,247,240,0.6)', marginTop: '0.2rem' }}>
                  🎁 First order — new user offers available!
                </div>
              )}
            </div>
            <div className="summary-body">

              {/* ── Discount Section ── */}
              <div className="discount-section">
                <div className="discount-label">🎁 Discount Code</div>

                {/* Input row */}
                <div className="discount-input-row">
                  <input
                    placeholder="Enter code…"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyCode()}
                    style={{ textTransform: 'uppercase' }}
                  />
                  <button className="btn btn-outline btn-sm" onClick={() => applyCode()}>Apply</button>
                </div>

                {/* Feedback message */}
                {discountMsg.text && (
                  <div style={{
                    fontSize: '0.8rem', marginBottom: '0.6rem', display: 'flex',
                    alignItems: 'center', gap: '0.4rem',
                    color: discountMsg.ok ? 'var(--jade)' : 'var(--red)'
                  }}>
                    {discountMsg.text}
                    {appliedDiscount && (
                      <button onClick={removeDiscount}
                        style={{ marginLeft: '0.25rem', background: 'none', border: 'none',
                          color: 'var(--red)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                        ✕ Remove
                      </button>
                    )}
                  </div>
                )}

                {/* Toggle available offers */}
                {enrichedDiscounts.length > 0 && (
                  <button className="discount-available-toggle" onClick={() => setShowOffers(!showOffers)}>
                    🏷 {showOffers ? 'Hide' : 'View'} available offers
                    <span style={{ fontSize: '0.7rem' }}>{showOffers ? '▲' : '▼'}</span>
                  </button>
                )}

                {showOffers && (
                  <div className="discount-offers-list">

                    {/* Eligible offers */}
                    {eligibleDiscounts.length > 0 && (
                      <>
                        <div style={{
                          padding: '0.4rem 0.9rem', fontSize: '0.7rem', fontWeight: 700,
                          color: 'var(--jade)', textTransform: 'uppercase', letterSpacing: '0.06em',
                          background: 'rgba(45,134,83,0.05)', borderBottom: '1px solid #ede8de'
                        }}>
                          ✅ Available for you
                        </div>
                        {eligibleDiscounts.map(d => (
                          <div key={d.discountId} className="discount-offer-item"
                            onClick={() => handleOfferClick(d)}
                            style={{ cursor: 'pointer' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span className="offer-code">{d.discountOfferType}</span>
                                <span style={{
                                  fontSize: '0.68rem', background: 'rgba(45,134,83,0.1)',
                                  color: 'var(--jade)', padding: '0.1rem 0.45rem',
                                  borderRadius: '20px', fontWeight: 700
                                }}>{d.tag}</span>
                              </div>
                              <div className="offer-apply">{d.reason}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div className="offer-pct">{d.discountPercentage}% OFF</div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--jade)', fontWeight: 600 }}>Tap to apply</div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Locked offers */}
                    {ineligibleDiscounts.length > 0 && (
                      <>
                        <div style={{
                          padding: '0.4rem 0.9rem', fontSize: '0.7rem', fontWeight: 700,
                          color: 'var(--text-pale)', textTransform: 'uppercase', letterSpacing: '0.06em',
                          background: '#faf7f0', borderBottom: '1px solid #ede8de',
                          borderTop: eligibleDiscounts.length > 0 ? '2px solid #ede8de' : 'none'
                        }}>
                          🔒 Locked — not yet eligible
                        </div>
                        {ineligibleDiscounts.map(d => (
                          <div key={d.discountId} className="discount-offer-item"
                            style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span className="offer-code" style={{ color: '#aaa' }}>
                                  {d.discountOfferType}
                                </span>
                              </div>
                              <div className="offer-apply" style={{ color: '#c0392b' }}>
                                🔒 {d.reason}
                              </div>
                            </div>
                            <div className="offer-pct" style={{ color: '#bbb' }}>
                              {d.discountPercentage}% OFF
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="divider" />
              <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
              {appliedDiscount && (
                <div className="summary-row discount">
                  <span>Discount ({appliedDiscount.discountOfferType} · {appliedDiscount.discountPercentage}%)</span>
                  <span>−₹{discountAmt.toFixed(2)}</span>
                </div>
              )}
              <div className="divider" />
              <div className="summary-row total">
                <span>Total</span><span>₹{finalTotal.toFixed(2)}</span>
              </div>
              <br />
              <button className="btn btn-primary btn-full" onClick={() => setStep(1)}>
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: Delivery ── */}
      {step === 1 && (
        <div className="section-card" style={{ maxWidth: 560 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.4rem', color: 'var(--forest)', marginBottom: '1.5rem' }}>
            🏠 Delivery Details
          </h3>
          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <textarea className="form-control" rows={3}
              placeholder="Enter your full delivery address"
              value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
          </div>
          <div className="summary-row total" style={{ marginBottom: '1.5rem' }}>
            <span>Order Total</span><span>₹{finalTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-primary" disabled={loading} onClick={handlePlaceOrder}>
              {loading ? '⏳ Placing…' : '✅ Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Payment ── */}
      {step === 2 && (
        <div className="section-card" style={{ maxWidth: 560 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.4rem', color: 'var(--forest)', marginBottom: '1.5rem' }}>
            💳 Complete Payment
          </h3>
          <div className="alert alert-success">Order #{orderId} placed! Choose payment to confirm.</div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="CARD">💳 Credit / Debit Card</option>
              <option value="UPI">📱 UPI</option>
              <option value="WALLET">👛 Wallet</option>
              <option value="COD">🚪 Cash on Delivery</option>
            </select>
          </div>
          <div className="summary-row total" style={{ marginBottom: '1.5rem' }}>
            <span>Amount to Pay</span><span>₹{finalTotal.toFixed(2)}</span>
          </div>
          <button className="btn btn-gold btn-full" disabled={loading} onClick={handlePayment}>
            {loading ? '⏳ Processing…' : `Pay ₹${finalTotal.toFixed(2)} via ${paymentMethod}`}
          </button>
        </div>
      )}

      {/* ── STEP 3: Confirmation ── */}
      {step === 3 && (
        <div className="section-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '2rem', color: 'var(--forest)', marginBottom: '0.5rem' }}>
            Order Confirmed!
          </h2>
          <p style={{ color: 'var(--text-soft)', marginBottom: '0.4rem' }}>
            Your order #{orderId} has been placed and payment received.
          </p>
          <p style={{ color: 'var(--text-pale)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            You'll receive a notification once it's out for delivery 🚚
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/orders')}>View Orders</button>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>Continue Shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}
