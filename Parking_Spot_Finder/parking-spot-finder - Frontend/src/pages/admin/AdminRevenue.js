import React, { useState, useEffect, useCallback } from 'react';
import { walletAPI, transactionAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function computeBalance(txns) {
  return txns.reduce((acc, t) => {
    const a = Number(t.amount) || 0;
    if (t.transactionType === 'CREDIT' || t.transactionType === 'REFUND') return acc + a;
    if (t.transactionType === 'DEBIT') return acc - a;
    return acc;
  }, 0);
}

export default function AdminRevenue() {
  const { user } = useAuth();
  const [wallet,     setWallet]     = useState(null);
  const [txns,       setTxns]       = useState([]);
  const [allWallets, setAllWallets] = useState([]);
  const [allUsers,   setAllUsers]   = useState([]);
  const [allTxns,    setAllTxns]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [migrating,  setMigrating]  = useState(false);
  const [migrateResult, setMigrateResult] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: 'info' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [wRes, tRes, uRes] = await Promise.all([
        walletAPI.getAll(), transactionAPI.getAll(), userAPI.getAll()
      ]);
      const wallets      = wRes.data || [];
      const transactions = tRes.data || [];
      const users        = uRes.data || [];

      setAllWallets(wallets);
      setAllTxns(transactions);
      setAllUsers(users);

      // Find admin wallet by logged-in userId
      let myWallet = wallets.find(w => w.user?.userId === user.userId);

      // Fallback: find via ADMIN_COMMISSION transactions
      if (!myWallet) {
        const adminTxns   = transactions.filter(t => t.purpose?.includes('ADMIN_COMMISSION'));
        const adminWalIds = [...new Set(adminTxns.map(t => t.wallet?.walletId).filter(Boolean))];
        myWallet = wallets.find(w => adminWalIds.includes(w.walletId));
      }

      setWallet(myWallet || null);
      if (myWallet) {
        setTxns(
          transactions
            .filter(t => t.wallet?.walletId === myWallet.walletId)
            .sort((a, b) => new Date(b.transactionTime) - new Date(a.transactionTime))
        );
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleMigrate = async () => {
    if (!window.confirm(
      'Run wallet migration?\n\nThis will scan all existing bookings and back-fill missing admin commission and lender payment transactions.\n\nSafe to run multiple times — already-processed bookings are skipped.'
    )) return;

    setMigrating(true); setMigrateResult(null);
    try {
      const res = await api.post('/admin/migrate-wallets');
      setMigrateResult(res.data);
      setMsg({ text: `Migration complete! ${res.data.processed} bookings processed, ${res.data.skipped} skipped.`, type: 'success' });
      // Reload data
      await load();
    } catch (err) {
      setMsg({ text: 'Migration failed: ' + (err.response?.data?.message || err.message), type: 'error' });
    } finally {
      setMigrating(false);
      setTimeout(() => setMsg({ text: '', type: 'info' }), 6000);
    }
  };

  const adminBalance    = txns.length > 0 ? computeBalance(txns) : Number(wallet?.balance || 0);
  const totalCommission = txns.filter(t => t.transactionType === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
  const totalReversals  = txns.filter(t => t.transactionType === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);
  const platformTotal   = allTxns.filter(t => t.purpose?.includes('ADMIN_COMMISSION')).reduce((s, t) => s + Number(t.amount), 0);

  const lenderSummary = allUsers
    .filter(u => u.role === 'SPOT_LENDER')
    .map(u => {
      const w     = allWallets.find(w => w.user?.userId === u.userId);
      const wTxns = w ? allTxns.filter(t => t.wallet?.walletId === w.walletId) : [];
      const bal   = wTxns.length > 0 ? computeBalance(wTxns) : Number(w?.balance || 0);
      const earned= wTxns.filter(t => t.transactionType === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
      return { user: u, balance: bal, totalEarned: earned, txnCount: wTxns.length };
    });

  const txnColor = { CREDIT: 'var(--success)', DEBIT: 'var(--danger)' };
  const txnPrefix = { CREDIT: '+', DEBIT: '-' };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Platform Revenue</h1>
          <p className="page-subtitle">10% commission on every booking payment</p>
        </div>
        <button
          className="btn btn-primary"
          disabled={migrating}
          onClick={handleMigrate}>
          {migrating ? '⏳ Running...' : '⚡ Sync Old Transactions'}
        </button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: 20 }}>
          {msg.text}
        </div>
      )}

      {/* Migration result detail */}
      {migrateResult && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(0,212,170,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.95rem' }}>Migration Report</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setMigrateResult(null)}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
            {[
              ['Total Bookings', migrateResult.totalBookings],
              ['Processed',      migrateResult.processed,  'var(--success)'],
              ['Skipped',        migrateResult.skipped,    'var(--text-muted)'],
              ['Admin Found',    migrateResult.adminUserFound ? `Yes (ID #${migrateResult.adminUserId})` : 'No', migrateResult.adminUserFound ? 'var(--success)' : 'var(--danger)'],
            ].map(([label, val, color]) => (
              <div key={label}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontWeight: 700, color: color || 'var(--text-primary)' }}>{val}</div>
              </div>
            ))}
          </div>
          {migrateResult.log && migrateResult.log.length > 0 && (
            <div style={{ maxHeight: 200, overflow: 'auto', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
              {migrateResult.log.map((line, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{line}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card highlight">
          <div className="stat-label">Admin Balance</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>₹{adminBalance.toFixed(2)}</div>
          {wallet && <div className="stat-meta">Wallet #{wallet.walletId} · User #{user.userId}</div>}
          {!wallet && <div className="stat-meta" style={{ color: 'var(--warning)' }}>No wallet yet — click Sync</div>}
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Commission</div>
          <div className="stat-value" style={{ color: 'var(--success)', fontSize: '1.4rem' }}>₹{totalCommission.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reversals</div>
          <div className="stat-value" style={{ color: 'var(--danger)', fontSize: '1.4rem' }}>₹{totalReversals.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Commission</div>
          <div className="stat-value" style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>₹{(totalCommission - totalReversals).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Platform Total (all time)</div>
          <div className="stat-value" style={{ fontSize: '1.3rem' }}>₹{platformTotal.toFixed(2)}</div>
        </div>
      </div>

      {/* Lender Wallets */}
      {lenderSummary.length > 0 && (
        <>
          <h2 style={{ marginBottom: 14 }}>Lender Wallets</h2>
          <div className="table-wrap" style={{ marginBottom: 28 }}>
            <table>
              <thead>
                <tr><th>Lender</th><th>Email</th><th>Current Balance</th><th>Total Earned</th><th>Transactions</th></tr>
              </thead>
              <tbody>
                {lenderSummary.map(({ user: u, balance, totalEarned, txnCount }) => (
                  <tr key={u.userId}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ fontWeight: 700, color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      ₹{balance.toFixed(2)}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>₹{totalEarned.toFixed(2)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{txnCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Admin Transactions */}
      <h2 style={{ marginBottom: 14 }}>My Commission Transactions</h2>
      {txns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <div className="empty-title">No commission transactions yet</div>
          <div className="empty-desc">
            Click <strong>"⚡ Sync Old Transactions"</strong> above to back-fill commissions from existing bookings,
            or make a new booking to start earning commission.
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Type</th><th>Purpose</th><th>Amount</th><th>Booking</th><th>Time</th></tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t.transactionId}>
                  <td style={{ color: 'var(--text-muted)' }}>#{t.transactionId}</td>
                  <td><span style={{ fontWeight: 700, color: txnColor[t.transactionType] || 'var(--text-primary)' }}>{t.transactionType}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{(t.purpose || '—').replace(/_/g, ' ')}</td>
                  <td style={{ fontWeight: 700, color: txnColor[t.transactionType] }}>
                    {txnPrefix[t.transactionType] || ''}₹{Number(t.amount).toFixed(2)}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {t.booking ? `#${t.booking.bookingId}` : '—'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {t.transactionTime ? new Date(t.transactionTime).toLocaleString() : '—'}
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
