import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, spotAPI, slotAPI, vehicleAPI, walletAPI, transactionAPI, userAPI } from '../services/api';

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{value || '—'}</span>
    </div>
  );
}

/** Compute true wallet balance from transaction history */
function computeBalance(txns) {
  return txns.reduce((acc, t) => {
    const amt = Number(t.amount) || 0;
    if (t.transactionType === 'CREDIT' || t.transactionType === 'REFUND') return acc + amt;
    if (t.transactionType === 'DEBIT') return acc - amt;
    return acc;
  }, 0);
}

export default function Dashboard() {
  const { user, isUser, isLender, isAdmin, updateUser } = useAuth();
  const [stats,    setStats]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', phoneNo: user?.phoneNo || '' });
  const [saveMsg,  setSaveMsg]  = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (isUser) {
          const [bRes, vRes, wRes, tRes] = await Promise.allSettled([
            bookingAPI.getAll(),
            vehicleAPI.getAll(),
            walletAPI.getAll(),
            transactionAPI.getAll(),
          ]);
          const bookings     = bRes.status === 'fulfilled' ? bRes.value.data : [];
          const vehicles     = vRes.status === 'fulfilled' ? vRes.value.data : [];
          const wallets      = wRes.status === 'fulfilled' ? wRes.value.data : [];
          const transactions = tRes.status === 'fulfilled' ? tRes.value.data : [];

          const myBookings = bookings.filter(b => b.user?.userId === user.userId);
          const myVehicles = vehicles.filter(v => v.user?.userId === user.userId);
          const myWallet   = wallets.find(w => w.user?.userId === user.userId);

          /* Compute live balance from transactions — always accurate */
          let walletBalance = '—';
          if (myWallet) {
            const myTxns = transactions.filter(t => t.wallet?.walletId === myWallet.walletId);
            walletBalance = myTxns.length > 0
              ? computeBalance(myTxns)
              : Number(myWallet.balance || 0);
          }

          setStats({
            totalBookings:  myBookings.length,
            activeBookings: myBookings.filter(b => b.bookingStatus === 'CONFIRMED').length,
            vehicles:       myVehicles.length,
            walletBalance,
          });
        }

        if (isLender) {
          const [sRes, bRes, slRes] = await Promise.allSettled([
            spotAPI.getAll(), bookingAPI.getAll(), 
            slotAPI.getAll()
          ]);
          const spots    = sRes.status  === 'fulfilled' ? sRes.value.data  : [];
          const bookings = bRes.status  === 'fulfilled' ? bRes.value.data  : [];
          const slots    = slRes.status === 'fulfilled' ? slRes.value.data : [];

          const mySpots   = spots.filter(s => s.user?.userId === user.userId);
          const mySlotIds = slots
            .filter(sl => mySpots.some(sp => sp.spotId === sl.spot?.spotId))
            .map(sl => sl.slotId);
          const myBookings = bookings.filter(b => mySlotIds.includes(b.slot?.slotId));

          setStats({
            totalSpots:    mySpots.length,
            approvedSpots: mySpots.filter(s => s.approvalStatus === 'APPROVED').length,
            pendingSpots:  mySpots.filter(s => s.approvalStatus === 'PENDING').length,
            totalBookings: myBookings.length,
          });
        }

        if (isAdmin) {
          const [sRes, uRes, bRes] = await Promise.allSettled([
            spotAPI.getAll(), userAPI.getAll(), bookingAPI.getAll()
          ]);
          const spots    = sRes.status === 'fulfilled' ? sRes.value.data : [];
          const users    = uRes.status === 'fulfilled' ? uRes.value.data : [];
          const bookings = bRes.status === 'fulfilled' ? bRes.value.data : [];
          setStats({
            totalSpots:    spots.length,
            pendingSpots:  spots.filter(s => s.approvalStatus === 'PENDING').length,
            totalUsers:    users.length,
            totalBookings: bookings.length,
          });
        }
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [user, isUser, isLender, isAdmin]);

  const handleSaveProfile = async () => {
    try {
      updateUser({ ...user, ...editForm });
      setSaveMsg('Profile updated!');
      setEditMode(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Update failed.');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const roleBadge = { USER: 'badge-confirmed', SPOT_LENDER: 'badge-approved', ADMIN: 'badge-pending' };

  const walletDisplay = () => {
    const b = stats.walletBalance;
    if (b === '—') return '—';
    const num = Number(b);
    return (
      <span style={{ color: num < 0 ? 'var(--danger)' : undefined }}>
        ₹{num.toFixed(2)}
      </span>
    );
  };

  return (
    <div className="page-wrapper page-enter">
      {saveMsg && <div className="alert alert-success">{saveMsg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            👋 Hello, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="page-subtitle">
            <span className={`badge ${roleBadge[user?.role] || ''}`}>{user?.role}</span>
            &nbsp;&nbsp;{user?.email}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* ── Stats + Quick Actions ── */}
        <div>
          {isUser && (
            <div className="stat-grid">
              <div className="stat-card highlight">
                <div className="stat-label">Total Bookings</div>
                <div className="stat-value">{stats.totalBookings ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active</div>
                <div className="stat-value">{stats.activeBookings ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Vehicles</div>
                <div className="stat-value">{stats.vehicles ?? 0}</div>
              </div>
              <div className="stat-card highlight">
                <div className="stat-label">Wallet Balance</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                  {walletDisplay()}
                </div>
              </div>
            </div>
          )}

          {isLender && (
            <div className="stat-grid">
              <div className="stat-card highlight">
                <div className="stat-label">Total Spots</div>
                <div className="stat-value">{stats.totalSpots ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Approved</div>
                <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.approvedSpots ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending</div>
                <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pendingSpots ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Bookings on My Spots</div>
                <div className="stat-value">{stats.totalBookings ?? 0}</div>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="stat-grid">
              <div className="stat-card highlight">
                <div className="stat-label">Total Spots</div>
                <div className="stat-value">{stats.totalSpots ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Awaiting Approval</div>
                <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pendingSpots ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Registered Users</div>
                <div className="stat-value">{stats.totalUsers ?? 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Bookings</div>
                <div className="stat-value">{stats.totalBookings ?? 0}</div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card" style={{ marginTop: 0 }}>
            <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {isUser && <>
                <Link to="/search"   className="btn btn-primary btn-sm">🔍 Find Parking</Link>
                <Link to="/bookings" className="btn btn-secondary btn-sm">📋 My Bookings</Link>
                <Link to="/vehicles" className="btn btn-secondary btn-sm">🚗 Vehicles</Link>
                <Link to="/wallet"   className="btn btn-secondary btn-sm">💳 Wallet</Link>
              </>}
              {isLender && <>
                <Link to="/lender/add-spot"  className="btn btn-primary btn-sm">+ Add Spot</Link>
                <Link to="/lender/earnings" className="btn btn-secondary btn-sm">💰 Earnings</Link>
                <Link to="/lender/my-spots" className="btn btn-secondary btn-sm">🅿 My Spots</Link>
                <Link to="/lender/my-slots" className="btn btn-secondary btn-sm">⋮ My Slots</Link>
              </>}
              {isAdmin && <>
                <Link to="/admin/spots"     className="btn btn-primary btn-sm">✓ Approve Spots</Link>
                <Link to="/admin/bookings"  className="btn btn-primary btn-sm">📋 All Bookings</Link>
                <Link to="/admin/revenue"   className="btn btn-primary btn-sm">📊 Revenue</Link>
                <Link to="/admin/pricing"   className="btn btn-secondary btn-sm">💲 Pricing Rules</Link>
                <Link to="/admin/pricing"   className="btn btn-secondary btn-sm">💰 Pricing</Link>
                <Link to="/admin/locations" className="btn btn-secondary btn-sm">📍 Locations</Link>
<Link to="/admin/users"     className="btn btn-secondary btn-sm">👥 Users</Link>
              </>}
            </div>
          </div>
        </div>

        {/* ── Profile Card ── */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3>My Profile</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(e => !e)}>
              {editMode ? 'Cancel' : '✏ Edit'}
            </button>
          </div>

          {editMode ? (
            <>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={editForm.phoneNo}
                  onChange={e => setEditForm(f => ({ ...f, phoneNo: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSaveProfile}>Save</button>
            </>
          ) : (
            <>
              <InfoRow label="Name"    value={user?.name} />
              <InfoRow label="Email"   value={user?.email} />
              <InfoRow label="Phone"   value={user?.phoneNo} />
              <InfoRow label="Role"    value={user?.role} />
              <InfoRow label="User ID" value={`#${user?.userId}`} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
