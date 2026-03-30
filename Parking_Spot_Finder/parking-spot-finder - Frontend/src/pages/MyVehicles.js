import React, { useState, useEffect } from 'react';
import { vehicleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyVehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ vehicleNo: '' });
  const [error,    setError]    = useState('');
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await vehicleAPI.getAll();
      setVehicles((res.data || []).filter(v => v.user?.userId === user.userId));
    } catch { setError('Could not load vehicles.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.vehicleNo.trim()) { setError('Vehicle number is required.'); return; }
    setSaving(true); setError('');
    try {
      await vehicleAPI.create({ user: { userId: user.userId }, vehicleNo: form.vehicleNo.trim().toUpperCase() });
      setForm({ vehicleNo: '' }); setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle. (Vehicle number may already exist)');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">🚗 My Vehicles</h1>
          <p className="page-subtitle">{vehicles.length} registered vehicle{vehicles.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card" style={{ maxWidth:440, marginBottom:24 }}>
          <h3 style={{ marginBottom:20 }}>Register a Vehicle</h3>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Vehicle Registration Number</label>
              <input
                className="form-input"
                placeholder="e.g. TN01AB1234"
                value={form.vehicleNo}
                onChange={e => setForm({ vehicleNo: e.target.value })}
                style={{ textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:700 }}
              />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Adding...' : 'Add Vehicle'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <div className="empty-title">No vehicles registered</div>
          <div className="empty-desc">Add your vehicle to start booking parking spots</div>
        </div>
      ) : (
        <div className="card-grid">
          {vehicles.map(v => (
            <div key={v.vehicleId} className="card">
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{
                  width:52, height:52, borderRadius:'var(--radius-md)',
                  background:'var(--primary-dim)', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.4rem', flexShrink:0
                }}>🚗</div>
                <div>
                  <div style={{
                    fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.2rem',
                    letterSpacing:'0.08em', color:'var(--text-primary)'
                  }}>
                    {v.vehicleNo}
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>
                    Vehicle ID #{v.vehicleId}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop:16, padding:'8px 12px',
                background:'var(--bg-input)', borderRadius:'var(--radius-md)',
                display:'flex', justifyContent:'space-between'
              }}>
                <span style={{fontSize:'0.78rem', color:'var(--text-secondary)'}}>Owner</span>
                <span style={{fontSize:'0.78rem', fontWeight:600}}>{user.name || user.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
