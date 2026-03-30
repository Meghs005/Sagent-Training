import React, { useState, useEffect } from 'react';
import { locationAPI } from '../../services/api';

export default function AdminLocations() {
  const [locations, setLocations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form, setForm] = useState({ areaName: '', city: '', pincode: '', latitude: '', longitude: '' });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [msg,    setMsg]    = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await locationAPI.getAll();
      setLocations(res.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async e => {
    e.preventDefault();
    if (!form.areaName || !form.city) { setError('Area name and city are required.'); return; }
    setSaving(true); setError('');
    try {
      await locationAPI.create({
        areaName:  form.areaName,
        city:      form.city,
        pincode:   form.pincode,
        latitude:  form.latitude  ? Number(form.latitude)  : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });
      setForm({ areaName: '', city: '', pincode: '', latitude: '', longitude: '' });
      setShowForm(false);
      setMsg('Location added!');
      setTimeout(() => setMsg(''), 3000);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add location.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">📍 Manage Locations</h1>
          <p className="page-subtitle">{locations.length} locations in the system</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Add Location'}
        </button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {showForm && (
        <div className="card" style={{ maxWidth:540, marginBottom:28 }}>
          <h3 style={{ marginBottom:20 }}>Add New Location</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Area Name *</label>
                <input className="form-input" value={form.areaName} placeholder="e.g. Guindy"
                  onChange={e => setForm(f => ({...f, areaName: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-input" value={form.city} placeholder="e.g. Chennai"
                  onChange={e => setForm(f => ({...f, city: e.target.value}))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input className="form-input" value={form.pincode} placeholder="600032"
                  onChange={e => setForm(f => ({...f, pincode: e.target.value}))} />
              </div>
              <div className="form-group" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input type="number" step="any" className="form-input" value={form.latitude} placeholder="13.0067"
                  onChange={e => setForm(f => ({...f, latitude: e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input type="number" step="any" className="form-input" value={form.longitude} placeholder="80.2206"
                  onChange={e => setForm(f => ({...f, longitude: e.target.value}))} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Location'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {locations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📍</div>
          <div className="empty-title">No locations yet</div>
          <div className="empty-desc">Add locations to help lenders map their spots</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Area Name</th><th>City</th><th>Pincode</th><th>Coordinates</th></tr>
            </thead>
            <tbody>
              {locations.map(l => (
                <tr key={l.locationId}>
                  <td style={{color:'var(--text-muted)'}}>{l.locationId}</td>
                  <td style={{fontWeight:600}}>{l.areaName}</td>
                  <td>{l.city}</td>
                  <td>{l.pincode || '—'}</td>
                  <td style={{fontFamily:'monospace',fontSize:'0.82rem',color:'var(--text-secondary)'}}>
                    {l.latitude && l.longitude ? `${l.latitude}, ${l.longitude}` : '—'}
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
