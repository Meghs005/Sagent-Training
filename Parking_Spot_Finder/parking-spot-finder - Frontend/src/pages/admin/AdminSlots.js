import React, { useState, useEffect } from 'react';
import { slotAPI, spotAPI } from '../../services/api';

export default function AdminSlots() {
  const [slots,   setSlots]   = useState([]);
  const [spots,   setSpots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm,setShowForm]= useState(false);
  const [form, setForm] = useState({ spotId: '', slotNo: '', status: 'AVAILABLE' });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [msg,    setMsg]    = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [slRes, spRes] = await Promise.all([slotAPI.getAll(), spotAPI.getAll()]);
      setSlots(slRes.data || []);
      setSpots((spRes.data || []).filter(s => s.approvalStatus === 'APPROVED'));
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async e => {
    e.preventDefault();
    if (!form.spotId || !form.slotNo) { setError('Spot and slot number are required.'); return; }
    setSaving(true); setError('');
    try {
      await slotAPI.create({
        spot:   { spotId: Number(form.spotId) },
        slotNo: form.slotNo.trim().toUpperCase(),
        status: form.status,
      });
      setForm({ spotId: '', slotNo: '', status: 'AVAILABLE' });
      setShowForm(false);
      setMsg('Slot added!');
      setTimeout(() => setMsg(''), 3000);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot.');
    } finally { setSaving(false); }
  };

  const spotName = id => spots.find(s => s.spotId === id)?.spotName || `Spot #${id}`;

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">⋮ Manage Parking Slots</h1>
          <p className="page-subtitle">{slots.length} total slots across all spots</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Add Slot'}
        </button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {showForm && (
        <div className="card" style={{ maxWidth:440, marginBottom:28 }}>
          <h3 style={{ marginBottom:20 }}>Add Parking Slot</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Parking Spot *</label>
              <select className="form-select" value={form.spotId}
                onChange={e => setForm(f => ({...f, spotId: e.target.value}))}>
                <option value="">— Select approved spot —</option>
                {spots.map(s => (
                  <option key={s.spotId} value={s.spotId}>{s.spotName} ({s.locationCity})</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Slot Number *</label>
                <input className="form-input" value={form.slotNo} placeholder="A1"
                  onChange={e => setForm(f => ({...f, slotNo: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status}
                  onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="BOOKED">BOOKED</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Adding...' : 'Add Slot'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {slots.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🅿</div>
          <div className="empty-title">No slots configured</div>
          <div className="empty-desc">Add slots to approved parking spots</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Slot ID</th><th>Slot No</th><th>Parking Spot</th><th>Status</th></tr>
            </thead>
            <tbody>
              {slots.map(sl => (
                <tr key={sl.slotId}>
                  <td style={{color:'var(--text-muted)'}}>#{sl.slotId}</td>
                  <td style={{fontWeight:700,letterSpacing:'0.06em'}}>{sl.slotNo}</td>
                  <td>{sl.spot?.spotName || spotName(sl.spot?.spotId)}</td>
                  <td>
                    <span className={`badge badge-${sl.status?.toLowerCase() === 'available' ? 'available' : sl.status?.toLowerCase() === 'booked' ? 'booked' : 'reserved'}`}>
                      {sl.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
