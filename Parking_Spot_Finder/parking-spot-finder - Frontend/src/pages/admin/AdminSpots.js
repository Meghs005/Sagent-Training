import React, { useState, useEffect } from 'react';
import { spotAPI } from '../../services/api';
import api from '../../services/api';

export default function AdminSpots() {
  const [spots,          setSpots]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [filter,         setFilter]         = useState('PENDING');
  const [actionId,       setActionId]       = useState(null);
  const [reason,         setReason]         = useState('');
  const [showRejectModal,setShowRejectModal]= useState(null);
  const [msg,            setMsg]            = useState({ text: '', type: 'info' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await spotAPI.getAll();
      setSpots(res.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'info' }), 4000);
  };

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await spotAPI.approve(id);
      flash('Spot approved successfully! It is now live.');
      await load();
    } catch { flash('Approval failed.', 'error'); }
    finally { setActionId(null); }
  };

  const handleReject = async (id) => {
    if (!reason.trim()) {
      flash('Please enter a rejection reason.', 'error');
      return;
    }
    setActionId(id);
    try {
      /* Try the dedicated reject endpoint first */
      await api.post(`/spots/reject/${id}`, { reason: reason.trim() });
      flash('Spot rejected.');
      setShowRejectModal(null);
      setReason('');
      await load();
    } catch (err) {
      if (err.response?.status === 404) {
        /* Endpoint not yet in backend — add ParkingSpotController reject method */
        flash(
          'Rejection endpoint (/spots/reject/{id}) not found. Add it to ParkingSpotController (see backend fix).',
          'error'
        );
      } else {
        flash('Rejection failed: ' + (err.response?.data?.message || err.message), 'error');
      }
      setActionId(null);
    } finally { setActionId(null); }
  };

  const TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  const filtered = filter === 'ALL' ? spots : spots.filter(s => s.approvalStatus === filter);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">✓ Approve Parking Spots</h1>
          <p className="page-subtitle">{spots.filter(s => s.approvalStatus === 'PENDING').length} pending reviews</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t}
            className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(t)}>
            {t} ({t === 'ALL' ? spots.length : spots.filter(s => s.approvalStatus === t).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🅿</div>
          <div className="empty-title">No spots in this category</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(spot => (
            <div key={spot.spotId} className="card" style={{
              borderLeft:
                spot.approvalStatus === 'PENDING'  ? '3px solid var(--warning)' :
                spot.approvalStatus === 'APPROVED' ? '3px solid var(--success)' :
                                                     '3px solid var(--danger)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontSize: '1rem' }}>{spot.spotName}</h3>
                    <span className={`badge badge-${(spot.approvalStatus || '').toLowerCase()}`}>
                      {spot.approvalStatus}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '6px 20px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                        {spot.location?.areaName
                          ? `${spot.location.areaName}, ${spot.location.city}`
                          : spot.locationCity || '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submitted by</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                        {spot.user?.name || spot.user?.email || `User #${spot.user?.userId}`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>₹{spot.pricePerHr}/hr</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Address</div>
                      <div style={{ fontSize: '0.88rem' }}>{spot.address || '—'}</div>
                    </div>
                    {spot.approvalTime && (
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Decision time</div>
                        <div style={{ fontSize: '0.82rem' }}>{new Date(spot.approvalTime).toLocaleString()}</div>
                      </div>
                    )}
                    {spot.approvalReason && (
                      <div style={{ gridColumn: '1/-1' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Admin Reason</div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--warning)' }}>{spot.approvalReason}</div>
                      </div>
                    )}
                  </div>
                </div>

                {spot.approvalStatus === 'PENDING' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 110 }}>
                    <button
                      className="btn btn-success btn-sm"
                      disabled={actionId === spot.spotId}
                      onClick={() => handleApprove(spot.spotId)}>
                      {actionId === spot.spotId ? '...' : '✓ Approve'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={actionId === spot.spotId}
                      onClick={() => { setShowRejectModal(spot.spotId); setReason(''); }}>
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Reject Spot</span>
              <button className="modal-close" onClick={() => setShowRejectModal(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 16 }}>
              Provide a reason. This will be shown to the spot lender.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Invalid address, duplicate listing, incomplete details..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-danger"
                disabled={actionId === showRejectModal || !reason.trim()}
                onClick={() => handleReject(showRejectModal)}>
                {actionId === showRejectModal ? 'Rejecting...' : 'Confirm Reject'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowRejectModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
