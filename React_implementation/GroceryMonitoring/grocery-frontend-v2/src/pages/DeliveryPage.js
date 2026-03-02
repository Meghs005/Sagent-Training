import React, { useState, useEffect } from 'react';
import { getAllDeliveries } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TL_STEPS = [
  { label: 'Order Confirmed', icon: '✅', key: ['CONFIRM', 'PENDING'] },
  { label: 'Preparing Order', icon: '👨‍🍳', key: ['PREPAR'] },
  { label: 'Out for Delivery', icon: '🛵', key: ['OUT', 'WAY', 'TRANSIT'] },
  { label: 'Delivered', icon: '🏠', key: ['DELIVER'] },
];

function getStepIdx(status) {
  if (!status) return 0;
  const s = status.toUpperCase();
  for (let i = TL_STEPS.length - 1; i >= 0; i--) {
    if (TL_STEPS[i].key.some(k => s.includes(k))) return i;
  }
  return 0;
}

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    getAllDeliveries()
      .then(r => setDeliveries(r.data.filter(d => d.user?.userId === user?.userId)))
      .catch(() => setError('Could not load deliveries. Ensure backend is running.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="page"><div className="spinner-wrap"><div className="spinner" /><p>Loading deliveries…</p></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Delivery Tracking</h1>
        <p className="page-subtitle">Real-time status of your active deliveries</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {deliveries.length === 0 ? (
        <div className="empty-state">
          <div className="emo">🚚</div>
          <h3>No active deliveries</h3>
          <p>Place an order to see delivery tracking here.</p>
        </div>
      ) : (
        deliveries.map(d => {
          const stepIdx = getStepIdx(d.deliveryStatus);
          return (
            <div key={d.deliveryId} className="delivery-card">
              <div className="delivery-card-header">
                <div>
                  <div className="delivery-card-title">🚚 Delivery #{d.deliveryId}</div>
                  {d.order && <div style={{ color: 'rgba(250,247,240,0.6)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Order #{d.order.orderId}</div>}
                </div>
                <div>
                  {stepIdx === 3
                    ? <span className="badge badge-green">✓ Delivered</span>
                    : stepIdx === 2 ? <span className="badge badge-gold">🛵 On the way</span>
                    : <span className="badge badge-gray">⏳ Processing</span>}
                </div>
              </div>

              <div className="delivery-card-body">
                {/* Meta info */}
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {d.deliveryPersonName && (
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-pale)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Delivery Partner</div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>👤 {d.deliveryPersonName}</div>
                    </div>
                  )}
                  {d.deliveryAddress && (
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-pale)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Address</div>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>📍 {d.deliveryAddress}</div>
                    </div>
                  )}
                  {d.deliveryDate && (
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-pale)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</div>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>📅 {new Date(d.deliveryDate).toLocaleString('en-IN')}</div>
                    </div>
                  )}
                </div>

                {/* Notification */}
                {d.notification && (
                  <div className="notification-banner">
                    🔔 <strong>Update:</strong> {d.notification}
                  </div>
                )}

                {/* Timeline */}
                <div className="timeline" style={{ marginTop: '1.5rem' }}>
                  {TL_STEPS.map((s, i) => (
                    <div key={s.label} className="tl-item">
                      <div className={`tl-dot ${i < stepIdx ? 'done' : i === stepIdx ? 'current' : ''}`}>
                        {s.icon}
                      </div>
                      <div className="tl-text">
                        <h4>{s.label}</h4>
                        <p>
                          {i < stepIdx && <span className="done-text">✓ Completed</span>}
                          {i === stepIdx && <span className="active-text">In progress…</span>}
                          {i > stepIdx && 'Upcoming'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
