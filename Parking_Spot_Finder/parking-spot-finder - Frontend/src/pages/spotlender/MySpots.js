import React, { useState, useEffect } from 'react';
import { spotAPI, slotAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const SLOT_STATUSES = ['AVAILABLE', 'BLOCKED', 'INACTIVE'];

export default function MySpots() {
  const { user } = useAuth();
  const [spots,    setSpots]    = useState([]);
  const [slots,    setSlots]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [msg,      setMsg]      = useState({ text: '', type: 'info' });

  // Add slot modal
  const [addSlotFor,  setAddSlotFor]  = useState(null); // spotId
  const [slotForm,    setSlotForm]    = useState({ slotNo: '', status: 'AVAILABLE' });
  const [savingSlot,  setSavingSlot]  = useState(false);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'info' }), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, slRes, bRes] = await Promise.allSettled([
        spotAPI.getAll(), slotAPI.getAll(), bookingAPI.getAll()
      ]);
      const allSpots    = sRes.status  === 'fulfilled' ? sRes.value.data  : [];
      const allSlots    = slRes.status === 'fulfilled' ? slRes.value.data : [];
      const allBookings = bRes.status  === 'fulfilled' ? bRes.value.data  : [];

      setSpots(allSpots.filter(s => s.user?.userId === user.userId));
      setSlots(allSlots);
      setBookings(allBookings);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const getSlotsForSpot    = spotId => slots.filter(sl => sl.spot?.spotId === spotId);
  const getBookingsForSpot = spotId => {
    const slotIds = getSlotsForSpot(spotId).map(sl => sl.slotId);
    return bookings.filter(b => slotIds.includes(b.slot?.slotId));
  };

  const handleAddSlot = async e => {
    e.preventDefault();
    if (!slotForm.slotNo.trim()) { flash('Slot number is required.', 'error'); return; }
    setSavingSlot(true);
    try {
      await slotAPI.create({
        spot:   { spotId: addSlotFor },
        slotNo: slotForm.slotNo.trim().toUpperCase(),
        status: slotForm.status,
      });
      setSlotForm({ slotNo: '', status: 'AVAILABLE' });
      setAddSlotFor(null);
      flash('Slot added successfully!');
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to add slot.', 'error');
    } finally { setSavingSlot(false); }
  };

  const handleToggleBlock = async (sl) => {
    const newStatus = sl.status === 'BLOCKED' ? 'AVAILABLE' : 'BLOCKED';
    const label     = newStatus === 'BLOCKED' ? 'block' : 'unblock';
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} slot ${sl.slotNo}?`)) return;
    try {
      // PATCH/PUT slot status — use PUT /slots/{id} (add to backend if not present)
      await api.put(`/slots/${sl.slotId}`, { ...sl, spot: { spotId: sl.spot?.spotId }, status: newStatus });
      flash(`Slot ${sl.slotNo} ${label}ed.`);
      await load();
    } catch (err) {
      // If PUT /slots not yet in backend, show instructions
      if (err.response?.status === 404 || err.response?.status === 405) {
        flash(`Add PUT /slots/{id} to ParkingSlotController to enable status updates.`, 'error');
      } else {
        flash(err.response?.data?.message || 'Update failed.', 'error');
      }
    }
  };

  const statusColor = { AVAILABLE: 'var(--success)', RESERVED: 'var(--warning)', BOOKED: 'var(--danger)', BLOCKED: '#888', INACTIVE: '#666' };
  const statusBg    = { AVAILABLE: 'rgba(34,197,94,0.12)', RESERVED: 'rgba(245,158,11,0.12)', BOOKED: 'rgba(239,68,68,0.12)', BLOCKED: 'rgba(100,100,100,0.15)', INACTIVE: 'rgba(80,80,80,0.1)' };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">🅿 My Parking Spots</h1>
          <p className="page-subtitle">{spots.length} spot{spots.length !== 1 ? 's' : ''} listed</p>
        </div>
        <a href="/lender/add-spot" className="btn btn-primary">+ Add New Spot</a>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      {spots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🅿</div>
          <div className="empty-title">No spots listed yet</div>
          <a href="/lender/add-spot" className="btn btn-primary" style={{ marginTop: 16 }}>+ Add Your First Spot</a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {spots.map(spot => {
            const spotSlots    = getSlotsForSpot(spot.spotId);
            const spotBookings = getBookingsForSpot(spot.spotId);
            const isOpen       = selected === spot.spotId;

            return (
              <div key={spot.spotId} className="card">
                {/* ── Spot Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: '1.1rem' }}>{spot.spotName}</h3>
                      <span className={`badge badge-${(spot.approvalStatus||'').toLowerCase()}`}>{spot.approvalStatus}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      📍 {spot.location?.areaName ? `${spot.location.areaName}, ${spot.location.city}` : spot.locationCity}
                      {spot.address && ` — ${spot.address}`}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
                      ₹{Number(spot.pricePerHr).toFixed(0)}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/hr</span>
                    </div>
                  </div>
                </div>

                {/* ── Slot Summary Chips ── */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {spotSlots.length === 0 ? (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No slots added yet</span>
                  ) : spotSlots.map(sl => (
                    <div key={sl.slotId} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '4px 10px 4px 10px', borderRadius: 99,
                      background: statusBg[sl.status] || statusBg.AVAILABLE,
                      border: `1px solid ${statusColor[sl.status] || statusColor.AVAILABLE}44`,
                    }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: statusColor[sl.status] || 'var(--text-primary)' }}>
                        {sl.slotNo}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: statusColor[sl.status] || 'var(--text-secondary)' }}>
                        {sl.status}
                      </span>
                      {/* Block/Unblock button per slot */}
                      {(sl.status === 'AVAILABLE' || sl.status === 'BLOCKED') && (
                        <button
                          onClick={() => handleToggleBlock(sl)}
                          style={{
                            marginLeft: 2, padding: '1px 7px', borderRadius: 99, fontSize: '0.67rem',
                            fontWeight: 700, cursor: 'pointer',
                            background: sl.status === 'BLOCKED' ? 'rgba(34,197,94,0.15)' : 'rgba(100,100,100,0.2)',
                            color: sl.status === 'BLOCKED' ? 'var(--success)' : '#aaa',
                            border: 'none',
                          }}>
                          {sl.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── Stats Row ── */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
                  {[
                    ['Total Slots',    spotSlots.length,                                                    'var(--text-primary)'],
                    ['Available',      spotSlots.filter(s => s.status === 'AVAILABLE').length,              'var(--success)'],
                    ['Reserved/Booked',spotSlots.filter(s => s.status === 'RESERVED' || s.status === 'BOOKED').length, 'var(--warning)'],
                    ['Blocked',        spotSlots.filter(s => s.status === 'BLOCKED').length,                '#888'],
                    ['Total Bookings', spotBookings.length,                                                 'var(--text-primary)'],
                  ].map(([label, val, color]) => (
                    <div key={label}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
                      <div style={{ fontWeight: 700, color }}>{val}</div>
                    </div>
                  ))}
                </div>

                {spot.approvalReason && (
                  <div className={`alert ${spot.approvalStatus === 'REJECTED' ? 'alert-error' : 'alert-info'}`} style={{ marginBottom: 12 }}>
                    <strong>Admin Note:</strong> {spot.approvalReason}
                  </div>
                )}

                {/* ── Actions ── */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {spot.approvalStatus === 'APPROVED' && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => { setAddSlotFor(spot.spotId); setSlotForm({ slotNo: '', status: 'AVAILABLE' }); }}>
                      + Add Slot
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => setSelected(isOpen ? null : spot.spotId)}>
                    {isOpen ? '▲ Hide Bookings' : '▼ View Bookings'}
                  </button>
                </div>

                {/* ── Add Slot Inline Form ── */}
                {addSlotFor === spot.spotId && (
                  <div style={{ marginTop: 16, padding: '16px 20px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <h4 style={{ marginBottom: 14, fontSize: '0.9rem' }}>Add Slot to "{spot.spotName}"</h4>
                    <form onSubmit={handleAddSlot} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <label className="form-label">Slot Number</label>
                        <input className="form-input" placeholder="A1, B2..."
                          value={slotForm.slotNo}
                          onChange={e => setSlotForm(f => ({ ...f, slotNo: e.target.value }))} />
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <label className="form-label">Initial Status</label>
                        <select className="form-select" value={slotForm.status}
                          onChange={e => setSlotForm(f => ({ ...f, status: e.target.value }))}>
                          {SLOT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={savingSlot}>
                          {savingSlot ? '...' : 'Add'}
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm"
                          onClick={() => setAddSlotFor(null)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── Bookings Table ── */}
                {isOpen && (
                  <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                    <h4 style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Bookings on This Spot
                    </h4>
                    {spotBookings.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No bookings yet.</p>
                    ) : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr><th>#</th><th>Slot</th><th>User</th><th>Start</th><th>End</th><th>Status</th><th>Amount</th></tr>
                          </thead>
                          <tbody>
                            {spotBookings.slice(0, 15).map(b => (
                              <tr key={b.bookingId}>
                                <td>#{b.bookingId}</td>
                                <td>{b.slot?.slotNo}</td>
                                <td style={{ fontSize: '0.85rem' }}>{b.user?.name || b.user?.email || `#${b.user?.userId}`}</td>
                                <td style={{ fontSize: '0.8rem' }}>{b.startTime ? new Date(b.startTime).toLocaleString() : '—'}</td>
                                <td style={{ fontSize: '0.8rem' }}>{b.endTime   ? new Date(b.endTime).toLocaleString()   : '—'}</td>
                                <td><span className={`badge badge-${(b.bookingStatus||'').toLowerCase()}`}>{b.bookingStatus}</span></td>
                                <td style={{ fontWeight: 700 }}>₹{b.estimatedAmt ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
