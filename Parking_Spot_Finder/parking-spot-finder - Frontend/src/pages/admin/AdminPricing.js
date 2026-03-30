import React, { useState, useEffect } from 'react';
import { pricingAPI } from '../../services/api';

const DEFAULT_RULE = {
  locationKey: '',
  localityMultiplier: 1.0,
  peakMultiplier: 1.5,
  weekendMultiplier: 1.3,
  occupancyThreshold: 70,
  demandMultiplier: 1.2,
  description: '',
};

function MultiplierBadge({ val }) {
  const num = Number(val);
  const color = num > 1.2 ? 'var(--danger)' : num > 1 ? 'var(--warning)' : 'var(--success)';
  const label = num === 1 ? 'Standard' : `×${num}`;
  return (
    <span style={{
      padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
      background: `${color}22`, color, border: `1px solid ${color}44`
    }}>{label}</span>
  );
}

export default function AdminPricing() {
  const [rules,    setRules]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(DEFAULT_RULE);
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState({ text: '', type: 'info' });
  const [preview,  setPreview]  = useState(null);

  const load = async () => {
    setLoading(true);
    try { const res = await pricingAPI.getRules(); setRules(res.data || []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'info' }), 4000);
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!form.locationKey.trim()) { flash('Location key is required.', 'error'); return; }
    setSaving(true);
    try {
      await pricingAPI.saveRule({
        ...form,
        localityMultiplier: Number(form.localityMultiplier),
        peakMultiplier:     Number(form.peakMultiplier),
        weekendMultiplier:  Number(form.weekendMultiplier),
        occupancyThreshold: Number(form.occupancyThreshold),
        demandMultiplier:   Number(form.demandMultiplier),
      });
      flash(`Pricing rule saved for "${form.locationKey}"`);
      setShowForm(false);
      setForm(DEFAULT_RULE);
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'Save failed.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, key) => {
    if (!window.confirm(`Delete pricing rule for "${key}"?`)) return;
    try {
      await pricingAPI.deleteRule(id);
      flash(`Rule for "${key}" deleted.`);
      await load();
    } catch { flash('Delete failed.', 'error'); }
  };

  const handlePreview = async () => {
    if (!form.locationKey) return;
    try {
      const res = await pricingAPI.calculate({ basePrice: 100, city: form.locationKey });
      setPreview(res.data);
    } catch {}
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">💲 Pricing Rules</h1>
          <p className="page-subtitle">Locality-based & dynamic pricing configuration</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(s => !s); setForm(DEFAULT_RULE); setPreview(null); }}>
          {showForm ? 'Cancel' : '+ Add Rule'}
        </button>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 16 }}>{msg.text}</div>}

      {/* How pricing works */}
      <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(0,212,170,0.2)' }}>
        <h3 style={{ marginBottom: 12, fontSize: '0.92rem' }}>ℹ️ How Dynamic Pricing Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
          {[
            ['🗺️ Locality Multiplier', 'Base premium per zone/city. Premium zones charge more.'],
            ['⏰ Peak Hours (×1.5 default)', 'Weekdays 7–10 AM and 5–9 PM get peak surcharge.'],
            ['📅 Weekend (×1.3 default)', 'Saturday & Sunday apply weekend multiplier all day.'],
            ['📊 Demand / Occupancy (×1.2 default)', 'When >70% slots booked, demand multiplier activates.'],
          ].map(([title, desc]) => (
            <div key={title}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
              <div>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <strong>Formula:</strong> Effective Price = Base Price × Locality × Time (Peak/Weekend/Normal) × Demand
        </div>
      </div>

      {/* Add Rule Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Configure Pricing Rule</h3>
          <form onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City / Area Name *</label>
                <input className="form-input" placeholder="e.g. Chennai, Mumbai, Nungambakkam"
                  value={form.locationKey} onChange={e => f('locationKey', e.target.value)} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Must match the city name used in parking spots
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="e.g. Premium downtown zone"
                  value={form.description} onChange={e => f('description', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 16 }}>
              {[
                ['localityMultiplier',  'Locality Multiplier',      '1.0 = standard, 1.2 = 20% premium'],
                ['peakMultiplier',      'Peak Hours Multiplier',     '7–10am, 5–9pm weekdays'],
                ['weekendMultiplier',   'Weekend Multiplier',        'Saturday & Sunday all day'],
                ['demandMultiplier',    'High-Demand Multiplier',    'When occupancy > threshold'],
              ].map(([key, label, hint]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input type="number" step="0.05" min="0.5" max="5" className="form-input"
                    value={form[key]} onChange={e => f(key, e.target.value)} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{hint}</span>
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Occupancy Threshold (%)</label>
                <input type="number" min="10" max="100" className="form-input"
                  value={form.occupancyThreshold} onChange={e => f('occupancyThreshold', e.target.value)} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Demand multiplier kicks in above this</span>
              </div>
            </div>

            {/* Live preview */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handlePreview}>
                👁 Preview effective price (base ₹100)
              </button>
              {preview && (
                <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Now:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{preview.effectivePrice}</span>
                  {preview.isPeak    && <span className="badge badge-pending">PEAK</span>}
                  {preview.isWeekend && <span className="badge badge-reserved">WEEKEND</span>}
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    ×{preview.localityMult} locality · ×{preview.timeMult} time · ×{preview.demandMult} demand
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Rule'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Rules Table */}
      {rules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💲</div>
          <div className="empty-title">No pricing rules configured</div>
          <div className="empty-desc">
            Add rules to apply locality premiums and dynamic pricing. Without rules, all spots use base pricing with default multipliers.
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Location</th><th>Locality</th><th>Peak (7-10am, 5-9pm)</th>
                <th>Weekend</th><th>Occupancy ≥</th><th>High-Demand</th><th>Description</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.locationKey}</td>
                  <td><MultiplierBadge val={r.localityMultiplier} /></td>
                  <td><MultiplierBadge val={r.peakMultiplier} /></td>
                  <td><MultiplierBadge val={r.weekendMultiplier} /></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.occupancyThreshold}%</td>
                  <td><MultiplierBadge val={r.demandMultiplier} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.description || '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id, r.locationKey)}>
                      Delete
                    </button>
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
