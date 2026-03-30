import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { slotAPI, bookingAPI, vehicleAPI, walletAPI, transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  getDynamicMultiplier, getZoneMultiplier,
  computeOccupancyRate, googleMapsNavUrl
} from '../utils/pricingEngine';

function toISOWithSeconds(dt) {
  if (!dt) return '';
  return /T\d{2}:\d{2}:\d{2}/.test(dt) ? dt : dt + ':00';
}

function computeBalance(txns) {
  return txns.reduce((acc, t) => {
    const a = Number(t.amount) || 0;
    if (t.transactionType === 'CREDIT' || t.transactionType === 'REFUND') return acc + a;
    if (t.transactionType === 'DEBIT') return acc - a;
    return acc;
  }, 0);
}

const HOLD_SECS = 10 * 60;

function HoldTimer({ createdAt, onExpire }) {
  const [secs, setSecs] = useState(() => Math.max(0, HOLD_SECS - Math.floor((Date.now() - createdAt) / 1000)));
  useEffect(() => {
    if (secs <= 0) { onExpire(); return; }
    const id = setInterval(() => setSecs(s => { if (s <= 1) { clearInterval(id); onExpire(); return 0; } return s - 1; }), 1000);
    return () => clearInterval(id);
  }, []);
  const mins = String(Math.floor(secs / 60)).padStart(2, '0');
  const sec  = String(secs % 60).padStart(2, '0');
  const pct  = (secs / HOLD_SECS) * 100;
  const urgent = secs < 120;
  const color  = urgent ? 'var(--danger)' : 'var(--warning)';
  return (
    <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: 16,
      background: urgent ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
      border: `1px solid ${urgent ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>⏳ Payment Hold Active</span>
        <span style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'var(--font-display)', color, letterSpacing: '0.05em' }}>
          {mins}:{sec}
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 1s linear', borderRadius: 3 }} />
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
        {urgent ? '⚠ Hurry! Pay now or the slot will be released.' : 'Pay advance before timer expires to confirm.'}
      </p>
    </div>
  );
}

export default function BookingPage() {
  const { spotId } = useParams();
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const spot       = state?.spot;
  const passedEffectivePrice = state?.effectivePrice;

  const [slots,        setSlots]        = useState([]);
  const [allSlots,     setAllSlots]     = useState([]);
  const [allBookings,  setAllBookings]  = useState([]);
  const [vehicles,     setVehicles]     = useState([]);
  const [walletBal,    setWalletBal]    = useState(null);
  const [form,         setForm]         = useState({ slotId: '', vehicleId: '', startTime: '', endTime: '' });
  const [formLoading,  setFormLoading]  = useState(true);
  const [formError,    setFormError]    = useState('');
  const [reserving,    setReserving]    = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [holdCreatedAt,  setHoldCreatedAt]  = useState(null);
  const [holdExpired,    setHoldExpired]    = useState(false);
  const [paying,         setPaying]         = useState(false);
  const [payError,       setPayError]       = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    async function load() {
      setFormLoading(true);
      try {
        const [sRes, vRes, wRes, tRes, bRes] = await Promise.all([
          slotAPI.getAll(), vehicleAPI.getAll(),
          walletAPI.getAll(), transactionAPI.getAll(), bookingAPI.getAll()
        ]);
        const avail = (sRes.data || []).filter(sl =>
          sl.spot?.spotId === Number(spotId) && sl.status === 'AVAILABLE'
        );
        setSlots(avail);
        setAllSlots((sRes.data || []).filter(sl => sl.spot?.spotId === Number(spotId)));
        setAllBookings(bRes.data || []);
        setVehicles((vRes.data || []).filter(v => v.user?.userId === user.userId));
        const myWallet = (wRes.data || []).find(w => w.user?.userId === user.userId);
        if (myWallet) {
          const myTxns = (tRes.data || []).filter(t => t.wallet?.walletId === myWallet.walletId);
          setWalletBal(myTxns.length > 0 ? computeBalance(myTxns) : Number(myWallet.balance || 0));
        } else { setWalletBal(0); }
      } catch { setFormError('Failed to load data.'); }
      finally { setFormLoading(false); }
    }
    load();
  }, [spotId, user]);

  /* Dynamic pricing */
  const occupancy = computeOccupancyRate(allSlots, allBookings);
  const zoneM     = getZoneMultiplier(spot?.location?.locationId);
  const { multiplier: dynM, reasons } = getDynamicMultiplier(form.startTime || new Date().toISOString(), occupancy);
  const effectiveRate = passedEffectivePrice
    ? Number((passedEffectivePrice / Number(spot?.pricePerHr || 1)).toFixed(4)) * Number(spot?.pricePerHr || 0)
    : Number((Number(spot?.pricePerHr || 0) * zoneM * dynM).toFixed(2));

  const calcEstimate = () => {
    if (!form.startTime || !form.endTime) return null;
    const hrs = (new Date(form.endTime) - new Date(form.startTime)) / 3600000;
    if (hrs <= 0) return null;
    const rate = Number((Number(spot?.pricePerHr || 0) * zoneM * dynM).toFixed(2));
    return Number((hrs * rate).toFixed(2));
  };

  const estimate = calcEstimate();
  const advance  = estimate ? Number((estimate * 0.5).toFixed(2)) : null;
  const canPay   = walletBal === null || advance === null || walletBal >= advance;

  const handleReserve = async e => {
    e.preventDefault();
    setFormError('');
    if (!form.slotId)    { setFormError('Select a slot.'); return; }
    if (!form.vehicleId) { setFormError('Select a vehicle.'); return; }
    if (new Date(form.endTime) <= new Date(form.startTime)) { setFormError('End time must be after start time.'); return; }
    setReserving(true);
    try {
      const res = await bookingAPI.create({
        userId: user.userId, slotId: Number(form.slotId),
        vehicleId: Number(form.vehicleId),
        startTime: toISOWithSeconds(form.startTime),
        endTime:   toISOWithSeconds(form.endTime),
      });
      setPendingBooking(res.data);
      setHoldCreatedAt(Date.now());
    } catch (err) { setFormError(err.response?.data?.message || 'Reservation failed.'); }
    finally { setReserving(false); }
  };

  const handlePayAdvance = async () => {
    if (!pendingBooking) return;
    setPaying(true); setPayError('');
    try {
      const res = await bookingAPI.payAdvance(pendingBooking.bookingId);
      setConfirmedBooking(res.data);
      setPendingBooking(null);
    } catch (err) { setPayError(err.response?.data?.message || 'Payment failed.'); }
    finally { setPaying(false); }
  };

  const handleHoldExpire = useCallback(() => { setHoldExpired(true); setPendingBooking(null); }, []);

  /* Navigation URL — prefer spot-level coords, fallback to linked location coords */
  const spotNavLat = spot?.latitude ?? spot?.location?.latitude;
  const spotNavLng = spot?.longitude ?? spot?.location?.longitude;
  const navUrl = spotNavLat && spotNavLng
    ? `https://www.google.com/maps/dir/?api=1&destination=${spotNavLat},${spotNavLng}&travelmode=driving`
    : null;

  /* ── Hold Expired ── */
  if (holdExpired) return (
    <div className="page-wrapper page-enter">
      <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>⏰</div>
        <h2 style={{ marginBottom: 8, color: 'var(--danger)' }}>Hold Expired</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The 10-minute window expired. Your slot has been released.</p>
        <button className="btn btn-primary" onClick={() => navigate('/search')}>Find Another Spot</button>
      </div>
    </div>
  );

  /* ── Payment Step ── */
  if (pendingBooking) {
    const est    = Number(pendingBooking.estimatedAmt);
    const advAmt = Number((est * 0.5).toFixed(2));
    const comm   = Number((advAmt * 0.1).toFixed(2));
    const lender = Number((advAmt - comm).toFixed(2));
    const canPayNow = walletBal === null || walletBal >= advAmt;
    return (
      <div className="page-wrapper page-enter">
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>🔒</div>
              <h2 style={{ marginBottom: 4 }}>Slot Held — Pay to Confirm</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Pay within the timer to confirm your slot.
              </p>
            </div>

            <HoldTimer createdAt={holdCreatedAt} onExpire={handleHoldExpire} />

            <div style={{ textAlign: 'center', padding: '14px', background: 'var(--primary-dim)', borderRadius: 'var(--radius-md)', marginBottom: 20, border: '1px solid rgba(0,212,170,0.3)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Reference</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--primary)', letterSpacing: '0.2em' }}>
                {pendingBooking.bookingCode}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {pendingBooking.startTime ? new Date(pendingBooking.startTime).toLocaleString() : '—'} →{' '}
                {pendingBooking.endTime   ? new Date(pendingBooking.endTime).toLocaleString()   : '—'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 16 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Payment Breakdown</div>
              {[
                ['Total Estimated',           `₹${est.toFixed(2)}`,    null],
                ['━ Advance Due (50%)',        `₹${advAmt.toFixed(2)}`, 'var(--primary)'],
                ['  → Platform Fee (10%)',     `₹${comm.toFixed(2)}`,   'var(--text-muted)'],
                ['  → To Spot Lender (90%)',   `₹${lender.toFixed(2)}`, 'var(--success)'],
                ['━ Remaining at Checkout',    `₹${advAmt.toFixed(2)}`, 'var(--warning)'],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.83rem', color: label.startsWith('━') ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: label.startsWith('━') ? 700 : 400 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: color || 'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 12,
              background: canPayNow ? 'rgba(0,212,170,0.08)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${canPayNow ? 'rgba(0,212,170,0.2)' : 'rgba(239,68,68,0.3)'}` }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>💳 Wallet</span>
              <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', color: canPayNow ? 'var(--primary)' : 'var(--danger)' }}>
                {walletBal !== null ? `₹${Number(walletBal).toFixed(2)}` : '...'}
              </span>
            </div>

            {!canPayNow && walletBal !== null && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>
                Need ₹{(advAmt - walletBal).toFixed(2)} more.{' '}
                <span style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate('/wallet')}>Top up →</span>
              </div>
            )}
            {payError && <div className="alert alert-error" style={{ marginBottom: 12 }}>{payError}</div>}

            <button className="btn btn-primary btn-full btn-lg" disabled={paying || !canPayNow} onClick={handlePayAdvance}>
              {paying ? 'Processing...' : `✅ Pay ₹${advAmt.toFixed(2)} & Confirm`}
            </button>
            <button className="btn btn-secondary btn-full" style={{ marginTop: 10 }}
              onClick={async () => { await bookingAPI.cancel(pendingBooking.bookingId); navigate('/search'); }}>
              Cancel & Release
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Confirmed ── */
  if (confirmedBooking) {
    const est    = Number(confirmedBooking.estimatedAmt);
    const advAmt = Number((est * 0.5).toFixed(2));
    const cLat = spot?.latitude ?? spot?.location?.latitude;
    const cLng = spot?.longitude ?? spot?.location?.longitude;
    const navLink = cLat && cLng
      ? `https://www.google.com/maps/dir/?api=1&destination=${cLat},${cLng}&travelmode=driving`
      : null;
    return (
      <div className="page-wrapper page-enter">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto', padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <h2 style={{ marginBottom: 4 }}>Booking Confirmed!</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--primary-dim)', borderRadius: 'var(--radius-md)', marginBottom: 20, border: '1px solid rgba(0,212,170,0.3)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Booking Code</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--primary)', letterSpacing: '0.2em' }}>
              {confirmedBooking.bookingCode}
            </div>
          </div>
          <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 16 }}>
            {[
              ['Total', `₹${est.toFixed(2)}`, null],
              ['✅ Advance Paid', `₹${advAmt.toFixed(2)}`, 'var(--success)'],
              ['⏳ Due at Checkout', `₹${advAmt.toFixed(2)}`, 'var(--warning)'],
              ['Start', confirmedBooking.startTime ? new Date(confirmedBooking.startTime).toLocaleString() : '—', null],
              ['End',   confirmedBooking.endTime   ? new Date(confirmedBooking.endTime).toLocaleString()   : '—', null],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{l}</span>
                <span style={{ fontWeight: 700, color: c || 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            💡 Free cancellation if cancelled &gt;1 hour before start.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/bookings')}>View Bookings</button>
            {navLink && (
              <a href={navLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                🗺 Navigate to Spot
              </a>
            )}
            <button className="btn btn-secondary" onClick={() => navigate('/search')}>Search More</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Booking Form ── */
  return (
    <div className="page-wrapper page-enter">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back</button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h2 style={{ marginBottom: 4 }}>Book a Slot</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
            {spot?.spotName || `Spot #${spotId}`}
          </p>

          {walletBal !== null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 16,
              background: walletBal <= 0 ? 'rgba(239,68,68,0.1)' : 'rgba(0,212,170,0.08)',
              border: `1px solid ${walletBal <= 0 ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,170,0.2)'}` }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>💳 Wallet</span>
              <span style={{ fontWeight: 800, color: walletBal <= 0 ? 'var(--danger)' : 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                ₹{Number(walletBal).toFixed(2)}
              </span>
            </div>
          )}

          {formError && <div className="alert alert-error">{formError}</div>}
          {formLoading ? <div style={{ display:'flex', justifyContent:'center', padding: 40 }}><div className="spinner" /></div> : (
            <form onSubmit={handleReserve}>
              <div className="form-group">
                <label className="form-label">Select Parking Slot</label>
                <select className="form-select" value={form.slotId}
                  onChange={e => setForm(f => ({ ...f, slotId: e.target.value }))}>
                  <option value="">— Choose a slot —</option>
                  {slots.map(sl => <option key={sl.slotId} value={sl.slotId}>Slot {sl.slotNo} — AVAILABLE</option>)}
                </select>
                {slots.length === 0 && <span style={{ fontSize: '0.78rem', color: 'var(--warning)' }}>⚠ No available slots.</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Your Vehicle</label>
                <select className="form-select" value={form.vehicleId}
                  onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))}>
                  <option value="">— Choose vehicle —</option>
                  {vehicles.map(v => <option key={v.vehicleId} value={v.vehicleId}>{v.vehicleNo}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input type="datetime-local" className="form-input" required value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input type="datetime-local" className="form-input" required value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>

              {/* Dynamic pricing breakdown */}
              {form.startTime && (
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: 14,
                  background: dynM > 1.2 ? 'rgba(245,158,11,0.08)' : 'rgba(0,212,170,0.06)',
                  border: `1px solid ${dynM > 1.2 ? 'rgba(245,158,11,0.25)' : 'rgba(0,212,170,0.18)'}` }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Pricing Breakdown
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px,1fr))', gap: 8, marginBottom: 8 }}>
                    {[
                      ['Base Rate',    `₹${Number(spot?.pricePerHr || 0).toFixed(0)}/hr`],
                      ['Zone ×',       `${zoneM.toFixed(1)}×`],
                      ['Time ×',       `${dynM.toFixed(2)}×`],
                      ['Demand ×',     occupancy > 0 ? `${(1 + occupancy * 0.4).toFixed(2)}×` : '1.00×'],
                      ['Effective Rate', `₹${effectiveRate.toFixed(0)}/hr`],
                    ].map(([l, v]) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{l}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: l === 'Effective Rate' ? 'var(--primary)' : 'var(--text-primary)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {reasons.map(r => (
                      <span key={r.label} style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
                        background: r.delta > 1 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.12)',
                        color: r.delta > 1 ? 'var(--warning)' : 'var(--success)',
                        border: `1px solid ${r.delta > 1 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.2)'}`,
                      }}>{r.icon} {r.label}</span>
                    ))}
                  </div>
                </div>
              )}

              {estimate && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 14,
                  background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.2)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                    {[['Total', `₹${estimate}`], ['Pay Now (50%)', `₹${advance}`], ['At Checkout', `₹${advance}`]].map(([l,v]) => (
                      <div key={l}><div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{l}</div><div style={{ fontWeight: 700 }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full btn-lg"
                disabled={reserving || slots.length === 0 || vehicles.length === 0}>
                {reserving ? 'Holding slot...' : '🔒 Reserve Slot (Pay on Next Screen)'}
              </button>
            </form>
          )}
        </div>

        <div>
          {spot && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 14 }}>Spot Details</h3>
              {[['Spot Name', spot.spotName], ['Location', spot.location ? `${spot.location.areaName}, ${spot.location.city}` : spot.locationCity], ['Address', spot.address]].filter(([,v])=>v).map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>{l}</span>
                  <span style={{ fontWeight:600, textAlign:'right', maxWidth:200 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>Base Rate</span>
                <span style={{ fontWeight:700, color:'var(--text-secondary)', textDecoration: effectiveRate !== Number(spot.pricePerHr) ? 'line-through' : 'none' }}>
                  ₹{Number(spot.pricePerHr).toFixed(0)}/hr
                </span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
                <span style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>Effective Rate</span>
                <span style={{ fontWeight:800, color:'var(--primary)', fontSize:'1.1rem' }}>₹{effectiveRate.toFixed(0)}/hr</span>
              </div>
              {navUrl && (
                <a href={navUrl} target="_blank" rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm btn-full" style={{ marginTop: 12 }}>
                  🗺 Open in Google Maps
                </a>
              )}
            </div>
          )}

          {estimate && (
            <div className="card" style={{ marginBottom: 16, borderColor:'rgba(0,212,170,0.4)', background:'linear-gradient(135deg,var(--bg-card),rgba(0,212,170,0.05))' }}>
              <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Estimated Total</div>
              <div style={{ fontSize:'2.4rem', fontWeight:800, fontFamily:'var(--font-display)', color:'var(--primary)' }}>₹{estimate}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>
                {((new Date(form.endTime) - new Date(form.startTime))/3600000).toFixed(1)} hrs × ₹{effectiveRate.toFixed(0)}/hr (effective)
              </div>
            </div>
          )}

          <div className="card">
            <h4 style={{ marginBottom:12, fontSize:'0.82rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>ℹ️ How It Works</h4>
            <ol style={{ paddingLeft:18, color:'var(--text-secondary)', fontSize:'0.83rem', lineHeight:2.3 }}>
              <li>Select slot, vehicle &amp; time → Reserve</li>
              <li>Slot held <strong style={{color:'var(--warning)'}}>10 min</strong> — no charge yet</li>
              <li>Pay <strong style={{color:'var(--primary)'}}>50% advance</strong> on next screen</li>
              <li>Pay <strong style={{color:'var(--warning)'}}>remaining 50%</strong> at checkout</li>
              <li>Late fees (1.5×) if overdue</li>
              <li><strong style={{color:'var(--success)'}}>Free cancel</strong> if &gt;1 hr before start</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
