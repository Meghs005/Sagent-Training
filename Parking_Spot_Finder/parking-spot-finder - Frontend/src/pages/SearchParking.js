import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotAPI, pricingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ── Geo helpers ── */
function toRad(deg) { return deg * (Math.PI / 180); }
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function fmtDist(km) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

/* ── Dynamic price computation (client-side, mirrors backend logic) ── */
function computeDynamicPrice(basePrice, rule) {
  if (!rule) return { effective: basePrice, mult: 1, label: '' };
  const now       = new Date();
  const hour      = now.getHours();
  const day       = now.getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;
  const isPeak    = !isWeekend && ((hour >= 7 && hour < 10) || (hour >= 17 && hour < 21));

  const localityM = Number(rule.localityMultiplier || 1);
  const timeM     = isPeak ? Number(rule.peakMultiplier || 1.5)
                  : isWeekend ? Number(rule.weekendMultiplier || 1.3) : 1;

  const effective = +(basePrice * localityM * timeM).toFixed(2);
  const label     = isPeak ? '🔴 Peak' : isWeekend ? '📅 Weekend' : '';
  return { effective, localityM, timeM, isPeak, isWeekend, label };
}

/* ── Navigation helper ──
 * Priority: spot.latitude → spot.location.latitude → address text search
 */
function openNavigation(spot) {
  // 1. Spot-level coords (entered by lender during registration)
  const lat = spot.latitude ?? spot.location?.latitude;
  const lng = spot.longitude ?? spot.location?.longitude;

  if (lat && lng) {
    // Use Maps directions with exact coords
    const dest = `${lat},${lng}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
      '_blank'
    );
  } else {
    // Fallback: text-based search with spot name + address for best accuracy
    const q = encodeURIComponent(
      [spot.spotName, spot.address, spot.location?.areaName, spot.locationCity]
        .filter(Boolean).join(', ')
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  }
}

/* ── Spot Card ── */
function SpotCard({ spot, distance, pricingInfo, onBook }) {
  const base      = Number(spot.pricePerHr);
  const dynPrice  = pricingInfo ? computeDynamicPrice(base, pricingInfo) : { effective: base, label: '' };
  const hasCoords = spot.location?.latitude && spot.location?.longitude;
  const locationStr = spot.location?.areaName
    ? `${spot.location.areaName}, ${spot.location.city}`
    : spot.locationCity;

  return (
    <div className="card spot-card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '0.98rem', marginBottom: 3 }}>{spot.spotName}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📍 {locationStr}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {distance != null && (
            <span style={{
              padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
              background: 'rgba(56,189,248,0.12)', color: 'var(--info)', border: '1px solid rgba(56,189,248,0.3)'
            }}>📡 {fmtDist(distance)}</span>
          )}
        </div>
      </div>

      {spot.address && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>{spot.address}</p>
      )}

      {/* Dynamic price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
          ₹{dynPrice.effective.toFixed(0)}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/hr</span>
        {dynPrice.effective !== base && (
          <>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{base.toFixed(0)}</span>
            {dynPrice.label && (
              <span style={{
                padding: '1px 6px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
                background: dynPrice.isPeak ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                color: dynPrice.isPeak ? 'var(--danger)' : 'var(--warning)'
              }}>{dynPrice.label}</span>
            )}
          </>
        )}
      </div>

      {/* Multiplier breakdown (if dynamic) */}
      {pricingInfo && dynPrice.effective !== base && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {dynPrice.localityM !== 1 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '1px 7px', borderRadius: 99 }}>
              Zone ×{dynPrice.localityM}
            </span>
          )}
          {dynPrice.timeM !== 1 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '1px 7px', borderRadius: 99 }}>
              {dynPrice.isPeak ? 'Peak' : 'Weekend'} ×{dynPrice.timeM}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
          onClick={() => onBook({ ...spot, effectivePrice: dynPrice.effective })}>
          Book Now
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => openNavigation(spot)}
          title={hasCoords ? 'Navigate with Google Maps' : 'Search on Google Maps'}>
          🗺 Navigate
        </button>
      </div>
    </div>
  );
}

export default function SearchParking() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [allSpots,    setAllSpots]    = useState([]);
  const [pricingRules,setPricingRules]= useState([]);
  const [loading,     setLoading]     = useState(true);
  const [city,        setCity]        = useState('');
  const [nameFilter,  setNameFilter]  = useState('');
  const [maxPrice,    setMaxPrice]    = useState('');
  const [sortBy,      setSortBy]      = useState('default'); // default | distance | price | price_desc
  const [userLocation,setUserLocation]= useState(null);      // { lat, lng }
  const [geoLoading,  setGeoLoading]  = useState(false);
  const [geoError,    setGeoError]    = useState('');
  const [error,       setError]       = useState('');

  /* Load spots + pricing rules on mount */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sRes, pRes] = await Promise.allSettled([spotAPI.getAll(), pricingAPI.getRules()]);
        if (sRes.status === 'fulfilled')
          setAllSpots((sRes.value.data || []).filter(s => s.approvalStatus === 'APPROVED'));
        if (pRes.status === 'fulfilled')
          setPricingRules(pRes.value.data || []);
      } catch { setError('Could not load spots.'); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  /* Find pricing rule for a spot */
  const getPricingRule = useCallback((spot) => {
    const city = spot.location?.city || spot.locationCity || '';
    const area = spot.location?.areaName || '';
    return pricingRules.find(r =>
      r.locationKey?.toLowerCase() === city.toLowerCase() ||
      r.locationKey?.toLowerCase() === area.toLowerCase()
    ) || null;
  }, [pricingRules]);

  /* Get user location */
  const requestLocation = () => {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported by your browser.'); return; }
    setGeoLoading(true); setGeoError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortBy('distance');
        setGeoLoading(false);
      },
      err => {
        setGeoError('Location access denied. Enable location in browser settings.');
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  };

  /* Calculate distance from user to spot */
  const getDistance = useCallback((spot) => {
    if (!userLocation) return null;
    const lat = spot.location?.latitude;
    const lng = spot.location?.longitude;
    if (!lat || !lng) return null;
    return haversineKm(userLocation.lat, userLocation.lng, lat, lng);
  }, [userLocation]);

  /* Filter + sort */
  const processed = (() => {
    let list = allSpots.map(s => ({
      ...s,
      _dist: getDistance(s),
      _rule: getPricingRule(s),
      get _dynPrice() {
        const p = computeDynamicPrice(Number(s.pricePerHr), this._rule);
        return p.effective;
      }
    }));

    // Filters
    if (city) {
      const q = city.toLowerCase().trim();
      list = list.filter(s => {
        const fields = [s.locationCity, s.location?.city, s.location?.areaName, s.address].map(f => (f || '').toLowerCase());
        return fields.some(f => f.includes(q));
      });
    }
    if (nameFilter) list = list.filter(s => s.spotName?.toLowerCase().includes(nameFilter.toLowerCase()));
    if (maxPrice) list = list.filter(s => s._dynPrice <= Number(maxPrice));

    // Sort
    if (sortBy === 'distance')   list.sort((a, b) => (a._dist ?? Infinity) - (b._dist ?? Infinity));
    if (sortBy === 'price')      list.sort((a, b) => a._dynPrice - b._dynPrice);
    if (sortBy === 'price_desc') list.sort((a, b) => b._dynPrice - a._dynPrice);

    return list;
  })();

  const hasDynamic = pricingRules.length > 0;
  const peakNow = (() => {
    const h = new Date().getHours(), d = new Date().getDay();
    const weekend = d === 0 || d === 6;
    return weekend ? 'weekend' : ((h >= 7 && h < 10) || (h >= 17 && h < 21)) ? 'peak' : 'normal';
  })();

  const handleBook = (spot) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/book/${spot.spotId}`, { state: { spot } });
  };

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">🔍 Find Parking</h1>
          <p className="page-subtitle">
            {loading ? 'Loading...' : `${allSpots.length} approved spots available`}
            {hasDynamic && (
              <span style={{
                marginLeft: 10, padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                background: peakNow === 'peak' ? 'rgba(239,68,68,0.12)' : peakNow === 'weekend' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
                color: peakNow === 'peak' ? 'var(--danger)' : peakNow === 'weekend' ? 'var(--warning)' : 'var(--success)'
              }}>
                {peakNow === 'peak' ? '🔴 Peak Hours' : peakNow === 'weekend' ? '📅 Weekend Pricing' : '🟢 Normal Pricing'}
              </span>
            )}
          </p>
        </div>

        {/* Nearby button */}
        <button
          className={`btn btn-sm ${userLocation ? 'btn-primary' : 'btn-secondary'}`}
          disabled={geoLoading}
          onClick={requestLocation}>
          {geoLoading ? '📡 Getting location...' : userLocation ? '📡 Nearby Active' : '📡 Show Nearby'}
        </button>
      </div>

      {geoError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{geoError}</div>}
      {error     && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {userLocation && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          📡 Using your location — spots sorted by distance. Spots without coordinates show at the bottom.
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '2', minWidth: 180 }}>
            <label className="form-label">City / Area</label>
            <input className="form-input" placeholder="e.g. Chennai, Mumbai..."
              value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div style={{ flex: '1', minWidth: 130 }}>
            <label className="form-label">Spot Name</label>
            <input className="form-input" placeholder="Name..."
              value={nameFilter} onChange={e => setNameFilter(e.target.value)} />
          </div>
          <div style={{ flex: '1', minWidth: 130 }}>
            <label className="form-label">Max Price (₹/hr)</label>
            <input type="number" min="0" className="form-input" placeholder="Any"
              value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
          <div style={{ flex: '1', minWidth: 150 }}>
            <label className="form-label">Sort By</label>
            <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="default">Default</option>
              <option value="distance" disabled={!userLocation}>📡 Nearest First</option>
              <option value="price">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>
          {(city || nameFilter || maxPrice) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm"
                onClick={() => { setCity(''); setNameFilter(''); setMaxPrice(''); }}>
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {hasDynamic && (
          <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dynamic pricing active:</span>
            {[['🔴 Peak', 'var(--danger)'], ['📅 Weekend', 'var(--warning)'], ['🟢 Normal', 'var(--success)']].map(([l, c]) => (
              <span key={l} style={{ fontSize: '0.75rem', color: c, fontWeight: 600 }}>{l}</span>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: 300 }}><div className="spinner" /></div>
      ) : (
        <>
          <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>
              <strong>{processed.length}</strong> spot{processed.length !== 1 ? 's' : ''}
              {(city || nameFilter || maxPrice) ? ' matching filters' : ' available'}
            </span>
            {hasDynamic && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Prices shown include dynamic pricing</span>}
          </div>

          {processed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔎</div>
              <div className="empty-title">No spots match your filters</div>
              <div className="empty-desc">Try clearing the filters or broadening your search</div>
            </div>
          ) : (
            <div className="card-grid">
              {processed.map(spot => (
                <SpotCard
                  key={spot.spotId}
                  spot={spot}
                  distance={spot._dist}
                  pricingInfo={spot._rule}
                  onBook={handleBook}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!user && processed.length > 0 && (
        <div className="alert alert-info" style={{ marginTop: 24 }}>
          💡 <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</a> to book a parking spot
        </div>
      )}
    </div>
  );
}
