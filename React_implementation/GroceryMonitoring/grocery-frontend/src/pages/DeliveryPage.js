import React, { useState, useEffect } from 'react';
import { getAllDeliveries } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = ['Order Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

function getStepIndex(status) {
  if (!status) return 0;
  const s = status.toUpperCase();
  if (s.includes('CONFIRM') || s === 'PENDING') return 0;
  if (s.includes('PREPAR')) return 1;
  if (s.includes('OUT') || s.includes('WAY') || s.includes('TRANSIT')) return 2;
  if (s.includes('DELIVER')) return 3;
  return 0;
}

const STEP_ICONS = ['✅', '👨‍🍳', '🛵', '🏠'];

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    getAllDeliveries()
      .then(res => {
        const mine = res.data.filter(d => d.user?.userId === user?.userId);
        setDeliveries(mine);
      })
      .catch(() => setError('Could not load deliveries. Make sure backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page">
      <div className="spinner-wrap"><div className="spinner" /><p>Loading deliveries...</p></div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">Delivery Tracking</h1>
      <p className="page-subtitle">Track the real-time status of your deliveries</p>

      {error && <div className="alert alert-error">{error}</div>}

      {deliveries.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🚚</div>
          <h3>No active deliveries</h3>
          <p>Place an order to see delivery tracking here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {deliveries.map(delivery => {
            const stepIdx = getStepIndex(delivery.deliveryStatus);
            return (
              <div key={delivery.deliveryId} className="card" style={{ padding: '1.5rem' }}>
                <div className="order-header">
                  <div>
                    <div className="order-id" style={{ fontSize: '1.1rem' }}>
                      🚚 Delivery #{delivery.deliveryId}
                    </div>
                    {delivery.order && (
                      <div className="order-date">Order #{delivery.order.orderId}</div>
                    )}
                    {delivery.deliveryPersonName && (
                      <div className="order-date" style={{ marginTop: 4 }}>
                        👤 Delivery Partner: <strong>{delivery.deliveryPersonName}</strong>
                      </div>
                    )}
                    {delivery.deliveryAddress && (
                      <div className="order-date" style={{ marginTop: 4 }}>
                        📍 {delivery.deliveryAddress}
                      </div>
                    )}
                    {delivery.deliveryDate && (
                      <div className="order-date">
                        📅 {new Date(delivery.deliveryDate).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className={`badge ${stepIdx === 3 ? 'badge-green' : stepIdx === 0 ? 'badge-gray' : 'badge-orange'}`}>
                      {delivery.deliveryStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Notification banner */}
                {delivery.notification && (
                  <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                    🔔 {delivery.notification}
                  </div>
                )}

                <div className="divider" />

                {/* Timeline */}
                <div className="delivery-timeline">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="timeline-item">
                      <div className={`timeline-dot ${i <= stepIdx ? 'active' : ''}`}>
                        {STEP_ICONS[i]}
                      </div>
                      <div className="timeline-content">
                        <h4 style={{ color: i <= stepIdx ? 'var(--green-deep)' : 'var(--text-light)' }}>{s}</h4>
                        <p>
                          {i < stepIdx ? '✓ Completed' :
                           i === stepIdx ? '⏳ In progress...' :
                           'Upcoming'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
