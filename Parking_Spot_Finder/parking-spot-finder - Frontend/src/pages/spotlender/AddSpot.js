import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotAPI, locationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AddSpot() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    spotName: '', address: '', pricePerHr: '',
    locationId: '', locationCity: '',
    latitude: '', longitude: ''
  });
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    locationAPI.getAll().then(res => setLocations(res.data || [])).catch(() => {});
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));

    // When lender picks a linked location, auto-fill city + coords if available
    if (name === 'locationId') {
      const loc = locations.find(l => String(l.locationId) === value);
      if (loc) {
        setForm(f => ({
          ...f,
          locationId:   value,
          locationCity: loc.city,
          latitude:     loc.latitude  ? String(loc.latitude)  : f.latitude,
          longitude:    loc.longitude ? String(loc.longitude) : f.longitude,
        }));
      }
    }
  };

  /* Use browser geolocation to auto-fill lat/lng */
  const handleAutoLocate = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => { setError('Location access denied.'); setLocating(false); },
      { timeout: 8000 }
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.spotName || !form.pricePerHr) { setError('Spot name and price are required.'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        user:     { userId: user.userId },
        spotName: form.spotName,
        address:  form.address,
        pricePerHr:   Number(form.pricePerHr),
        locationCity: form.locationCity || form.spotName,
        approvalStatus: 'PENDING',
      };
      if (form.locationId) {
        payload.location = {
          locationId: Number(form.locationId),
          // Pass updated coords back so they're available even if the location
          // record didn't have them set by admin
          latitude:  form.latitude  ? Number(form.latitude)  : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
        };
      }
      // Store lat/lng directly on the spot payload as well (backend fix handles this)
      if (form.latitude)  payload.latitude  = Number(form.latitude);
      if (form.longitude) payload.longitude = Number(form.longitude);

      await spotAPI.create(payload);
      setSuccess('Spot submitted! Awaiting admin approval.');
      setTimeout(() => navigate('/lender/my-spots'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit spot.');
    } finally { setLoading(false); }
  };

  const previewUrl = form.latitude && form.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${form.latitude},${form.longitude}`
    : null;

  return (
    <div className="page-wrapper page-enter">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h2 style={{ marginBottom: 4 }}>List Your Parking Spot</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
            Submit your spot for admin review. Once approved it appears in search results.
          </p>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Spot Name *</label>
              <input name="spotName" required className="form-input"
                placeholder="e.g. Nungambakkam Premium Parking"
                value={form.spotName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Full Address</label>
              <input name="address" className="form-input"
                placeholder="Street address, landmark..."
                value={form.address} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price per Hour (₹) *</label>
                <input name="pricePerHr" type="number" min="1" step="0.5" required
                  className="form-input" placeholder="50"
                  value={form.pricePerHr} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">City / Area</label>
                <input name="locationCity" className="form-input" placeholder="Chennai"
                  value={form.locationCity} onChange={handleChange} />
              </div>
            </div>

            {locations.length > 0 && (
              <div className="form-group">
                <label className="form-label">Link to Location (optional)</label>
                <select name="locationId" className="form-select" value={form.locationId} onChange={handleChange}>
                  <option value="">— Select a location —</option>
                  {locations.map(l => (
                    <option key={l.locationId} value={l.locationId}>
                      {l.areaName}, {l.city}{l.latitude ? ` ✓ coords` : ' (no coords)'}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Selecting a location with coords auto-fills the map pin below.
                </span>
              </div>
            )}

            {/* ── Coordinates ── */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: 18,
              background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="form-label" style={{ margin: 0 }}>
                  📍 Spot Coordinates <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(for map navigation)</span>
                </label>
                <button type="button" className="btn btn-secondary btn-sm"
                  disabled={locating} onClick={handleAutoLocate}>
                  {locating ? '📡 Locating...' : '📡 Use My Location'}
                </button>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Latitude</label>
                  <input name="latitude" type="number" step="any"
                    className="form-input" placeholder="e.g. 13.0527"
                    value={form.latitude} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Longitude</label>
                  <input name="longitude" type="number" step="any"
                    className="form-input" placeholder="e.g. 80.2418"
                    value={form.longitude} onChange={handleChange} />
                </div>
              </div>

              {previewUrl && (
                <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: 10, fontSize: '0.78rem',
                    color: 'var(--primary)', textDecoration: 'underline' }}>
                  🗺 Preview pin on Google Maps →
                </a>
              )}
              {!form.latitude && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                  💡 Enter coordinates so users can get directions to your exact parking spot.
                  Use "📡 Use My Location" if you're at the spot right now.
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Submitting...' : '📤 Submit for Approval'}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>📋 Submission Process</h3>
            <ol style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2.2 }}>
              <li>Fill out spot details and submit</li>
              <li>Spot enters <strong style={{ color: 'var(--warning)' }}>Pending Approval</strong></li>
              <li>Admin reviews your submission</li>
              <li>Approved spots go <strong style={{ color: 'var(--success)' }}>Live</strong> in search</li>
              <li>Users can navigate directly to your spot</li>
            </ol>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 12 }}>🗺 Why Coordinates Matter</h3>
            <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 2 }}>
              <li>Users get turn-by-turn directions to your <strong>exact</strong> spot</li>
              <li>Your spot appears in <strong>Nearby Spots</strong> sorted by distance</li>
              <li>No coordinates = generic area search (less accurate)</li>
              <li>Tip: Open Google Maps, find your spot, long-press to get coordinates</li>
            </ul>
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-input)',
              borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              📱 On mobile: Open Google Maps → search your address → tap "Share" → copy coordinates
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
