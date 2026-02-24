import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, deleteOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';

function statusClass(status) {
  if (!status) return 'badge-gray';
  const s = status.toUpperCase();
  if (s === 'CONFIRMED' || s === 'DELIVERED') return 'badge-green';
  if (s === 'PENDING') return 'badge-orange';
  if (s === 'CANCELLED') return 'badge-red';
  return 'badge-gray';
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = () => {
    getAllOrders()
      .then(res => {
        // Filter orders belonging to logged-in user
        const mine = res.data.filter(o => o.user?.userId === user?.userId);
        setOrders(mine);
      })
      .catch(() => setError('Could not load orders. Make sure backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    setDeleting(orderId);
    try {
      await deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.orderId !== orderId));
    } catch {
      setError('Failed to cancel order.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div className="page">
      <div className="spinner-wrap"><div className="spinner" /><p>Loading your orders...</p></div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">My Orders</h1>
      <p className="page-subtitle">Track and manage all your grocery orders</p>

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping to place your first order!</p>
          <br />
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Now</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <div>
                  <div className="order-id">Order #{order.orderId}</div>
                  <div className="order-date">
                    📅 {order.orderDate
                      ? new Date(order.orderDate).toLocaleString()
                      : 'Date not available'}
                  </div>
                  {order.cart && (
                    <div className="order-date" style={{ marginTop: 4 }}>
                      🛒 Cart #{order.cart.cartId}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${statusClass(order.orderStatus)}`}>
                    {order.orderStatus || 'PENDING'}
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--green-deep)' }}>
                    ₹{order.orderTotal?.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigate('/delivery')}
                >
                  🚚 Track Delivery
                </button>
                {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={deleting === order.orderId}
                    onClick={() => handleCancel(order.orderId)}
                  >
                    {deleting === order.orderId ? 'Cancelling...' : '✕ Cancel Order'}
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
