import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';

function statusBadge(status) {
  const map = {
    CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
    CANCELLED: 'badge-cancelled', CHECKED_OUT: 'badge-approved', RESERVED: 'badge-reserved',
  };
  return map[status] || 'badge-pending';
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('ALL');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    bookingAPI.getAll()
      .then(res => setBookings(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATUS_TABS = ['ALL', 'CONFIRMED', 'PENDING', 'CHECKED_OUT', 'CANCELLED'];

  let filtered = bookings;
  if (filter !== 'ALL') filtered = filtered.filter(b => b.bookingStatus === filter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(b =>
      String(b.bookingId).includes(q) ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q) ||
      b.slot?.slotNo?.toLowerCase().includes(q) ||
      b.vehicle?.vehicleNo?.toLowerCase().includes(q) ||
      b.bookingCode?.toLowerCase().includes(q)
    );
  }

  /* Totals */
  const totalRevenue = bookings
    .filter(b => b.bookingStatus === 'CHECKED_OUT' || b.finalAmt)
    .reduce((s, b) => s + Number(b.finalAmt || b.estimatedAmt || 0), 0);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 All Bookings</h1>
          <p className="page-subtitle">{bookings.length} total bookings in the system</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card highlight">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{bookings.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {bookings.filter(b => b.bookingStatus === 'CONFIRMED').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Checked Out</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {bookings.filter(b => b.bookingStatus === 'CHECKED_OUT').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cancelled</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {bookings.filter(b => b.bookingStatus === 'CANCELLED').length}
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₹{totalRevenue.toFixed(0)}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'flex-end' }}>
        <div style={{ flex: '1', minWidth: 200 }}>
          <label className="form-label">Search</label>
          <input className="form-input"
            placeholder="Booking ID, user, vehicle, slot, code..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_TABS.map(t => (
            <button key={t}
              className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(t)}>
              {t === 'ALL' ? `All (${bookings.length})` : `${t} (${bookings.filter(b => b.bookingStatus === t).length})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No bookings found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(b => (
            <div key={b.bookingId} className="card" style={{
              borderLeft: `3px solid ${
                b.bookingStatus === 'CONFIRMED'   ? 'var(--primary)' :
                b.bookingStatus === 'CHECKED_OUT' ? 'var(--success)' :
                b.bookingStatus === 'CANCELLED'   ? 'var(--danger)'  :
                'var(--warning)'}`
            }}>
              {/* Summary row (always visible) */}
              <div
                style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === b.bookingId ? null : b.bookingId)}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ID</div>
                  <div style={{ fontWeight: 700 }}>#{b.bookingId}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {b.user?.name || b.user?.email || `#${b.user?.userId}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Slot</div>
                  <div style={{ fontWeight: 600 }}>{b.slot?.slotNo || `#${b.slot?.slotId}`}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicle</div>
                  <div style={{ fontWeight: 600 }}>{b.vehicle?.vehicleNo || `#${b.vehicle?.vehicleId}`}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{b.finalAmt || b.estimatedAmt || '—'}</div>
                  {b.additionalFee > 0 && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>+₹{b.additionalFee} late</div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge ${statusBadge(b.bookingStatus)}`}>{b.bookingStatus}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {expanded === b.bookingId ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === b.bookingId && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '10px 24px' }}>
                    {b.bookingCode && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Code</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em' }}>{b.bookingCode}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Booking Date</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{b.bookingDate || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Start Time</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {b.startTime ? new Date(b.startTime).toLocaleString() : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>End Time</div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                        {b.endTime ? new Date(b.endTime).toLocaleString() : '—'}
                      </div>
                    </div>
                    {b.checkoutTime && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Checkout Time</div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{new Date(b.checkoutTime).toLocaleString()}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Amount</div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>₹{b.estimatedAmt || '—'}</div>
                    </div>
                    {b.additionalFee > 0 && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Late Fee</div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--danger)' }}>₹{b.additionalFee}</div>
                      </div>
                    )}
                    {b.finalAmt && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Final Amount</div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--success)' }}>₹{b.finalAmt}</div>
                      </div>
                    )}
                    {b.checkoutStatus && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Checkout Status</div>
                        <span className={`badge ${statusBadge(b.checkoutStatus)}`}>{b.checkoutStatus}</span>
                      </div>
                    )}
                    {b.cancellationReason && (
                      <div style={{ gridColumn: '1/-1' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cancellation Reason</div>
                        <div style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>{b.cancellationReason}</div>
                      </div>
                    )}
                    {b.cancellationTime && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cancelled At</div>
                        <div style={{ fontSize: '0.88rem' }}>{new Date(b.cancellationTime).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
