import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addCart, addOrder, addPayment, getAllDiscounts } from '../services/api';

const STEPS = ['Cart Review', 'Checkout', 'Payment', 'Confirmation'];

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [discountCode, setDiscountCode] = useState('');
  const [discountMsg, setDiscountMsg] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  const discountAmount = discount ? (cartTotal * discount.discountPercentage) / 100 : 0;
  const finalTotal = cartTotal - discountAmount;

  const applyDiscount = async () => {
    try {
      const res = await getAllDiscounts();
      const found = res.data.find(d =>
        d.discountOfferType?.toLowerCase() === discountCode.toLowerCase()
      );
      if (found) {
        setDiscount(found);
        setDiscountMsg(`✅ "${found.discountOfferType}" applied — ${found.discountPercentage}% off!`);
      } else {
        setDiscount(null);
        setDiscountMsg('❌ Invalid discount code.');
      }
    } catch {
      setDiscountMsg('Could not validate discount.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress) { setError('Please enter a delivery address.'); return; }
    setLoading(true); setError('');
    try {
      // 1. Create Cart
      const cartPayload = {
        cartTotal: finalTotal,
        user: { userId: user.userId },
        ...(discount ? { discount: { discountId: discount.discountId } } : {})
      };
      const cartRes = await addCart(cartPayload);

      // 2. Create Order
      const orderPayload = {
        orderTotal: finalTotal,
        orderStatus: 'CONFIRMED',
        user: { userId: user.userId },
        cart: { cartId: cartRes.data.cartId }
      };
      const orderRes = await addOrder(orderPayload);
      setOrderId(orderRes.data.orderId);
      setStep(2);
    } catch {
      setError('Failed to place order. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true); setError('');
    try {
      await addPayment({
        paymentMethod,
        paymentStatus: 'SUCCESS',
        paymentAmount: finalTotal,
        order: { orderId }
      });
      setStep(3);
      clearCart();
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some fresh groceries to get started!</p>
          <br />
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">Complete your order in a few easy steps</p>

      {/* Steps indicator */}
      <div className="checkout-steps" style={{ marginBottom: '2rem' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="step-num">{i < step ? '✓' : i + 1}</div>
              <div className="step-label">{s}</div>
            </div>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* STEP 0: Cart Review */}
      {step === 0 && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div style={{ padding: '1rem 1rem 0', borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ fontFamily: 'Playfair Display', color: 'var(--green-deep)' }}>
                Your Items ({cartItems.length})
              </h3>
            </div>
            {cartItems.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-icon">
                  {item.productCategory === 'Fruits' ? '🍎' :
                   item.productCategory === 'Vegetables' ? '🥦' :
                   item.productCategory === 'Dairy' ? '🥛' : '🛒'}
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.productName}</div>
                  <div className="cart-item-price">₹{item.productPrice?.toFixed(2)} each</div>
                </div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQty(item.productId, item.qty - 1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.productId, item.qty + 1)}>+</button>
                </div>
                <div style={{ fontWeight: 700, minWidth: 64, textAlign: 'right' }}>
                  ₹{(item.productPrice * item.qty).toFixed(2)}
                </div>
                <button className="btn btn-sm" style={{ background: 'none', color: 'var(--red)', fontSize: '1.1rem', padding: '0 0.4rem' }}
                  onClick={() => removeFromCart(item.productId)}>🗑</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 style={{ fontFamily: 'Playfair Display', color: 'var(--green-deep)', marginBottom: '1rem' }}>Order Summary</h3>

            {/* Discount code */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input className="form-control" placeholder="Discount code"
                value={discountCode} onChange={e => setDiscountCode(e.target.value)}
                style={{ flex: 1 }} />
              <button className="btn btn-outline btn-sm" onClick={applyDiscount}>Apply</button>
            </div>
            {discountMsg && <p style={{ fontSize: '0.82rem', marginBottom: '0.75rem' }}>{discountMsg}</p>}

            <div className="divider" />
            <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
            {discount && <div className="summary-row" style={{ color: 'var(--green-mid)' }}>
              <span>Discount ({discount.discountPercentage}%)</span>
              <span>−₹{discountAmount.toFixed(2)}</span>
            </div>}
            {cartTotal < 200 && <div className="summary-row" style={{ color: 'var(--orange)', fontSize: '0.82rem' }}>
              <span>💡 Spend ₹{(200 - cartTotal).toFixed(2)} more for ₹25 off!</span>
            </div>}
            <div className="summary-row summary-total"><span>Total</span><span>₹{finalTotal.toFixed(2)}</span></div>
            <br />
            <button className="btn btn-primary btn-full" onClick={() => setStep(1)}>
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Delivery Address */}
      {step === 1 && (
        <div className="card" style={{ maxWidth: 560, padding: '2rem' }}>
          <h3 style={{ fontFamily: 'Playfair Display', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>
            🏠 Delivery Details
          </h3>
          <div className="form-group">
            <label>Delivery Address</label>
            <textarea className="form-control" rows={3}
              placeholder="Enter your full delivery address"
              value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
          </div>
          <div className="summary-row summary-total">
            <span>Order Total</span><span>₹{finalTotal.toFixed(2)}</span>
          </div>
          <br />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-primary" disabled={loading} onClick={handlePlaceOrder}>
              {loading ? '⏳ Placing Order...' : '✅ Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Payment */}
      {step === 2 && (
        <div className="card" style={{ maxWidth: 560, padding: '2rem' }}>
          <h3 style={{ fontFamily: 'Playfair Display', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>
            💳 Payment
          </h3>
          <div className="alert alert-success">Order #{orderId} placed! Now complete payment.</div>
          <div className="form-group">
            <label>Payment Method</label>
            <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="CARD">💳 Credit / Debit Card</option>
              <option value="UPI">📱 UPI</option>
              <option value="WALLET">👛 Wallet</option>
              <option value="COD">🚪 Cash on Delivery</option>
            </select>
          </div>
          <div className="summary-row summary-total">
            <span>Amount to Pay</span><span>₹{finalTotal.toFixed(2)}</span>
          </div>
          <br />
          <button className="btn btn-orange btn-full" disabled={loading} onClick={handlePayment}>
            {loading ? '⏳ Processing...' : `Pay ₹${finalTotal.toFixed(2)} via ${paymentMethod}`}
          </button>
        </div>
      )}

      {/* STEP 3: Confirmation */}
      {step === 3 && (
        <div className="empty-state" style={{ background: 'white', borderRadius: 24, padding: '4rem 2rem', boxShadow: 'var(--shadow-md)' }}>
          <div className="icon">🎉</div>
          <h3 style={{ color: 'var(--green-deep)', fontSize: '1.8rem' }}>Order Confirmed!</h3>
          <p style={{ marginTop: '0.5rem' }}>Your order #{orderId} has been placed and payment received.</p>
          <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
            You'll receive a notification when it's out for delivery!
          </p>
          <br />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('/orders')}>View Orders</button>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>Continue Shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}
