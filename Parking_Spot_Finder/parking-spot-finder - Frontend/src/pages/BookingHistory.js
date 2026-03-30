import React, { useState, useEffect } from 'react';
import { bookingAPI, slotAPI, spotAPI } from '../services/api';
import { googleMapsNavUrl } from '../utils/pricingEngine';
import { useAuth } from '../context/AuthContext';

function statusBadge(status) {
  const map = {
    CONFIRMED: 'badge-confirmed', PENDING: 'badge-pending',
    CANCELLED: 'badge-cancelled', CHECKED_OUT: 'badge-approved',
  };
  return map[status] || 'badge-pending';
}


function openNavigation(booking) {
  const spot = booking.slot?.spot;
  const lat  = spot?.location?.latitude;
  const lng  = spot?.location?.longitude;
  if (lat && lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
  } else {
    const q = encodeURIComponent(`${spot?.spotName || ''} ${spot?.address || spot?.locationCity || ''}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  }
}

function RefundEligibility({ booking }) {
  if (booking.bookingStatus !== 'CONFIRMED') return null;
  const minsUntil  = (new Date(booking.startTime) - new Date()) / 60000;
  const eligible   = minsUntil > 60;
  const advancePaid = (Number(booking.estimatedAmt) * 0.5).toFixed(2);
  return (
    <div style={{
      padding: '7px 12px', borderRadius: 'var(--radius-sm)', marginTop: 10, fontSize: '0.77rem',
      background: eligible ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
      border: `1px solid ${eligible ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
      color: eligible ? 'var(--success)' : 'var(--danger)',
    }}>
      {eligible
        ? `✅ Free cancellation — advance ₹${advancePaid} will be refunded`
        : `⚠ No refund — within 1 hour of start time`}
    </div>
  );
}

export default function BookingHistory() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('ALL');
  const [actionId, setActionId] = useState(null);
  const [msg,      setMsg]      = useState({ text: '', type: 'info' });

  const load = async () => {
    setLoading(true);
    try {
      const res  = await bookingAPI.getAll();
      // Only this user's bookings, sorted newest first
      const mine = (res.data || [])
        .filter(b => b.user?.userId === user.userId)
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setBookings(mine);
    } catch { setMsg({ text: 'Could not load bookings.', type: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'info' }), 5000);
  };

  const handleCancel = async (b) => {
    const minsUntil = (new Date(b.startTime) - new Date()) / 60000;
    const eligible  = minsUntil > 60;
    const advance   = (Number(b.estimatedAmt) * 0.5).toFixed(2);
    const confirmMsg = eligible
      ? `Cancel booking?\n\n✅ Advance ₹${advance} will be REFUNDED to your wallet.`
      : `Cancel booking?\n\n⚠ NO REFUND — within 1 hour of start. Advance ₹${advance} is forfeited.`;
    if (!window.confirm(confirmMsg)) return;
    setActionId(b.bookingId);
    try {
      const res = await bookingAPI.cancel(b.bookingId);
      flash(res.data?.message || 'Booking cancelled.', eligible ? 'success' : 'warning');
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'Cancellation failed.', 'error');
    } finally { setActionId(null); }
  };

  const handleCheckout = async (b) => {
    const isLate    = new Date() > new Date(b.endTime);
    const remaining = (Number(b.estimatedAmt) * 0.5).toFixed(2);
    const confirmMsg = isLate
      ? `Checkout?\n\n⚠ You are late — late fees (1.5× rate) will be added to remaining ₹${remaining}.`
      : `Checkout?\n\nRemaining ₹${remaining} will be deducted from wallet.`;
    if (!window.confirm(confirmMsg)) return;
    setActionId(b.bookingId);
    try {
      const res     = await bookingAPI.checkout(b.bookingId);
      const updated = res.data;
      flash(
        `Checked out! Final: ₹${updated.finalAmt}` +
        (updated.additionalFee > 0 ? ` (late fee: ₹${updated.additionalFee})` : ''),
        'success'
      );
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'Checkout failed.', 'error');
    } finally { setActionId(null); }
  };

  const STATUS_TABS = ['ALL', 'CONFIRMED', 'CHECKED_OUT', 'CANCELLED'];
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.bookingStatus === filter);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 My Bookings</h1>
          <p className="page-subtitle">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: 16 }}>{msg.text}</div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {STATUS_TABS.map(s => (
          <button key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)}>
            {s === 'ALL' ? `All (${bookings.length})` : `${s} (${bookings.filter(b => b.bookingStatus === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No bookings found</div>
          <div className="empty-desc">{filter === 'ALL' ? "You haven't made any bookings yet." : `No ${filter.toLowerCase()} bookings.`}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((b, idx) => {
            /* Sequential numbering for THIS user: 1st booking = #1, 2nd = #2, etc. */
            /* bookings are sorted newest first, so reverse index for display */
            const userBookingNo = bookings.length - bookings.indexOf(b);
            const advancePaid   = (Number(b.estimatedAmt) * 0.5).toFixed(2);

            return (
              <div key={b.bookingId} className="card" style={{
                borderLeft: `3px solid ${
                  b.bookingStatus === 'CONFIRMED'   ? 'var(--primary)' :
                  b.bookingStatus === 'CHECKED_OUT' ? 'var(--success)' :
                  b.bookingStatus === 'CANCELLED'   ? 'var(--danger)'  : 'var(--warning)'}`
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
                        Booking #{userBookingNo}
                      </span>
                      <span className={`badge ${statusBadge(b.bookingStatus)}`}>{b.bookingStatus}</span>
                      {b.bookingCode && (
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', letterSpacing: '0.1em' }}>
                          {b.bookingCode}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '8px 20px' }}>
                      {[
                        ['Slot',    b.slot?.slotNo || `#${b.slot?.slotId}`],
                        ['Vehicle', b.vehicle?.vehicleNo || `#${b.vehicle?.vehicleId}`],
                        ['Start',   b.startTime ? new Date(b.startTime).toLocaleString() : '—'],
                        ['End',     b.endTime   ? new Date(b.endTime).toLocaleString()   : '—'],
                        ['Est. Total', `₹${b.estimatedAmt ?? '—'}`],
                        ['Advance Paid', `₹${advancePaid}`],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{val}</div>
                        </div>
                      ))}

                      {b.bookingStatus === 'CONFIRMED' && (
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Due at Checkout</div>
                          <div style={{ fontWeight: 700, color: 'var(--warning)' }}>₹{advancePaid}</div>
                        </div>
                      )}

                      {b.bookingStatus === 'CHECKED_OUT' && <>
                        {b.additionalFee > 0 && (
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Late Fee</div>
                            <div style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{b.additionalFee}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Final Amount</div>
                          <div style={{ fontWeight: 700, color: 'var(--success)' }}>₹{b.finalAmt}</div>
                        </div>
                        {b.checkoutTime && (
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Checkout Time</div>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{new Date(b.checkoutTime).toLocaleString()}</div>
                          </div>
                        )}
                      </>}
                    </div>

                    {b.cancellationReason && (
                      <div style={{ marginTop: 10, fontSize: '0.81rem',
                        color: b.cancellationReason.includes('refunded') ? 'var(--success)' : 'var(--danger)' }}>
                        ℹ️ {b.cancellationReason}
                      </div>
                    )}

                    <RefundEligibility booking={b} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 130 }}>
                    {b.bookingStatus === 'CONFIRMED' && <>
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => openNavigation(b)}
                        title="Navigate to parking spot">
                        🗺 Navigate
                      </button>
                      <button className="btn btn-success btn-sm"
                        disabled={actionId === b.bookingId}
                        onClick={() => handleCheckout(b)}>
                        {actionId === b.bookingId ? '...' : '✓ Checkout'}
                      </button>
                      <button className="btn btn-danger btn-sm"
                        disabled={actionId === b.bookingId}
                        onClick={() => handleCancel(b)}>
                        {actionId === b.bookingId ? '...' : '✕ Cancel'}
                      </button>
                    </>}
                    {/* Navigate button — shows if slot has a spot with coordinates */}
                    {b.slot?.spot?.location?.latitude && b.slot?.spot?.location?.longitude ? (
                      <a href={googleMapsNavUrl(b.slot.spot.location.latitude, b.slot.spot.location.longitude, b.slot.spot.spotName)}
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm">
                        🗺 Navigate
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
