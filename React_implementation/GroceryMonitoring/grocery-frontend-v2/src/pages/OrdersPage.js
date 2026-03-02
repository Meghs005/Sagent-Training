import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, deleteOrder, updateOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';

function statusBadge(status) {
  if (!status) return <span className="badge badge-gray">PLACED</span>;
  const s = status.toUpperCase();
  if (s === 'CONFIRMED') return <span className="badge badge-green">✓ CONFIRMED</span>;
  if (s === 'DELIVERED') return <span className="badge badge-green">🏠 DELIVERED</span>;
  if (s === 'PENDING')   return <span className="badge badge-gold">⏳ PENDING</span>;
  if (s === 'PLACED')    return <span className="badge badge-gray">📋 PLACED</span>;
  if (s === 'CANCELLED') return <span className="badge badge-red">✕ CANCELLED</span>;
  return <span className="badge badge-gray">{status}</span>;
}

// Custom confirm modal — no browser popup
function ConfirmModal({ orderId, onConfirm, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(13,35,24,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--r-lg)',
        padding: '2rem', maxWidth: 400, width: '100%',
        boxShadow: 'var(--shadow-lg)',
        animation: 'dropIn 0.2s ease',
      }}>
        <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>🛑</div>
        <h3 style={{
          fontFamily: 'Cormorant Garamond', fontSize: '1.4rem',
          color: 'var(--forest)', textAlign: 'center', marginBottom: '0.5rem'
        }}>
          Cancel Order #{orderId}?
        </h3>
        <p style={{ color: 'var(--text-soft)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          This action cannot be undone. Your order will be marked as cancelled.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost btn-full" onClick={onClose}>
            Keep Order
          </button>
          <button className="btn btn-danger btn-full" onClick={onConfirm}>
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null); // which order to confirm cancel
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getAllOrders()
      .then(r => setOrders(r.data.filter(o => o.user?.userId === user?.userId && o.orderStatus?.toUpperCase() !== 'CANCELLED')))
      .catch(() => setError('Could not load orders. Ensure backend is running.'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancelConfirmed = async () => {
    const id = confirmId;
    setConfirmId(null);
    setDeleting(id);
    setError('');

    // Strategy: try PUT to update status first, fallback to DELETE
    try {
      // Try updating orderStatus to CANCELLED via PUT
      await updateOrder(id, { orderStatus: 'CANCELLED' });
      // Update UI
      // Remove from list immediately
      setOrders(prev => prev.filter(o => o.orderId !== id));
    } catch (putErr) {
      // If PUT not supported, try DELETE
      try {
        await deleteOrder(id);
        setOrders(prev => prev.filter(o => o.orderId !== id));
      } catch (delErr) {
        // Both failed — show helpful message
        const msg = delErr?.response?.data?.message || delErr?.response?.data || '';
        if (String(msg).toLowerCase().includes('constraint') || delErr?.response?.status === 500) {
          setError('Cannot cancel: this order has a linked payment or delivery. Ask your admin to cancel from the backend, or add a PUT /orders/{id} endpoint.');
        } else {
          setError('Failed to cancel order. Please try again.');
        }
      }
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div className="page"><div className="spinner-wrap"><div className="spinner" /><p>Loading orders…</p></div></div>
  );

  return (
    <div className="page">
      {/* Custom cancel confirm modal */}
      {confirmId && (
        <ConfirmModal
          orderId={confirmId}
          onConfirm={handleCancelConfirmed}
          onClose={() => setConfirmId(null)}
        />
      )}

      <div className="page-header">
        <h1 className="page-title">My Orders</h1>
        <p className="page-subtitle">Track and manage all your grocery orders</p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ alignItems: 'flex-start' }}>
          <span>⚠️</span>
          <div>
            <strong>Cancel Failed</strong><br />
            <span style={{ fontWeight: 400 }}>{error}</span>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="emo">📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping to place your first order!</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Now</button>
        </div>
      ) : (
        <div>
          {orders.map(order => (
            <div key={order.orderId} className="order-card">
              <div className="order-card-top">
                <div>
                  <div className="order-id-label">Order #{order.orderId}</div>
                  <div className="order-meta">
                    📅 {order.orderDate ? new Date(order.orderDate).toLocaleString('en-IN') : '—'}
                    {order.cart && <span style={{ marginLeft: '1rem' }}>🛒 Cart #{order.cart.cartId}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {statusBadge(order.orderStatus)}
                  <div className="order-total-val" style={{ marginTop: '0.4rem' }}>
                    ₹{order.orderTotal?.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="order-card-foot">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/delivery')}>
                  🚚 Track Delivery
                </button>
                {!['DELIVERED', 'CANCELLED'].includes(order.orderStatus?.toUpperCase()) && (
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={deleting === order.orderId}
                    onClick={() => setConfirmId(order.orderId)}
                  >
                    {deleting === order.orderId ? '⏳ Cancelling…' : '✕ Cancel'}
                  </button>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
