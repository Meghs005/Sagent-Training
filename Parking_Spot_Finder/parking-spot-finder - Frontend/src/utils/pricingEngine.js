/**
 * ParkEase Dynamic + Locality Pricing Engine
 * ─────────────────────────────────────────
 * All multipliers are applied on top of the base spot price.
 */

/* ── Zone Multipliers (stored in localStorage, managed by admin) ── */
const ZONE_KEY = 'psf_zone_multipliers';

export function getZoneMultipliers() {
  try { return JSON.parse(localStorage.getItem(ZONE_KEY) || '{}'); }
  catch { return {}; }
}

export function setZoneMultiplier(locationId, multiplier) {
  const m = getZoneMultipliers();
  m[locationId] = multiplier;
  localStorage.setItem(ZONE_KEY, JSON.stringify(m));
}

export function getZoneMultiplier(locationId) {
  return getZoneMultipliers()[locationId] ?? 1.0;
}

/* ── Dynamic Pricing ── */

/** Peak-hour schedule (24h) */
const PEAK_HOURS = [
  { start: 8,  end: 10, label: 'Morning Rush',   multiplier: 1.5 },
  { start: 17, end: 20, label: 'Evening Rush',    multiplier: 1.5 },
  { start: 12, end: 14, label: 'Lunch Hour',      multiplier: 1.2 },
];
const OFF_PEAK_MULTIPLIER = 1.0;
const WEEKEND_MULTIPLIER  = 1.2;  // Sat/Sun base boost

/** Returns { multiplier, reasons[] } for a given datetime string */
export function getDynamicMultiplier(startTimeStr, occupancyRate = 0) {
  if (!startTimeStr) return { multiplier: 1.0, reasons: [] };

  const dt      = new Date(startTimeStr);
  const hour    = dt.getHours();
  const day     = dt.getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;

  let multiplier = 1.0;
  const reasons  = [];

  // Weekend base
  if (isWeekend) {
    multiplier *= WEEKEND_MULTIPLIER;
    reasons.push({ label: 'Weekend', delta: WEEKEND_MULTIPLIER, icon: '📅' });
  }

  // Peak hours (only weekdays for peak, weekends always busy)
  if (!isWeekend) {
    for (const peak of PEAK_HOURS) {
      if (hour >= peak.start && hour < peak.end) {
        multiplier *= peak.multiplier;
        reasons.push({ label: peak.label, delta: peak.multiplier, icon: '⚡' });
        break;
      }
    }
  }

  // Occupancy-based demand
  if (occupancyRate >= 0.9) {
    multiplier *= 1.4;
    reasons.push({ label: 'Very High Demand (90%+ occupied)', delta: 1.4, icon: '🔥' });
  } else if (occupancyRate >= 0.7) {
    multiplier *= 1.2;
    reasons.push({ label: 'High Demand (70%+ occupied)', delta: 1.2, icon: '📈' });
  } else if (occupancyRate >= 0.5) {
    multiplier *= 1.1;
    reasons.push({ label: 'Moderate Demand', delta: 1.1, icon: '📊' });
  }

  if (reasons.length === 0) reasons.push({ label: 'Off-Peak', delta: 1.0, icon: '✅' });

  return { multiplier: Number(multiplier.toFixed(4)), reasons };
}

/** Compute occupancy rate for a spot (0–1) given all slots and active bookings */
export function computeOccupancyRate(spotSlots, bookings) {
  if (!spotSlots || spotSlots.length === 0) return 0;
  const slotIds    = spotSlots.map(s => s.slotId);
  const active     = bookings.filter(b =>
    slotIds.includes(b.slot?.slotId) &&
    (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'PENDING_PAYMENT')
  ).length;
  return active / spotSlots.length;
}

/** Compute final effective price per hour */
export function computeEffectivePrice(basePricePerHr, locationId, startTimeStr, occupancyRate) {
  const zoneM    = getZoneMultiplier(locationId);
  const { multiplier: dynM, reasons } = getDynamicMultiplier(startTimeStr, occupancyRate);
  const total    = zoneM * dynM;
  const effective = Number((basePricePerHr * total).toFixed(2));
  return { effective, zoneM, dynM, total, reasons };
}

/* ── Haversine Distance ── */

/** Returns distance in km between two lat/lng points */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R  = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** Generate Google Maps navigation URL */
export function googleMapsNavUrl(lat, lng, name) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name || '')}`;
}

/** Generate Google Maps static embed URL (no API key needed for basic link) */
export function googleMapsEmbedUrl(lat, lng) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}
