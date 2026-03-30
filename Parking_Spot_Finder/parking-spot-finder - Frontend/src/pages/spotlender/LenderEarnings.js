import React, { useState, useEffect } from 'react';
import { walletAPI, transactionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function computeBalance(txns) {
  return txns.reduce((acc, t) => {
    const a = Number(t.amount) || 0;
    if (t.transactionType === 'CREDIT' || t.transactionType === 'REFUND') return acc + a;
    if (t.transactionType === 'DEBIT') return acc - a;
    return acc;
  }, 0);
}

export default function LenderEarnings() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [txns,   setTxns]   = useState([]);
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [wRes, tRes] = await Promise.all([walletAPI.getAll(), transactionAPI.getAll()]);
        const myWallet = (wRes.data || []).find(w => w.user?.userId === user.userId);
        setWallet(myWallet || null);
        if (myWallet) {
          const mine = (tRes.data || [])
            .filter(t => t.wallet?.walletId === myWallet.walletId)
            .sort((a, b) => new Date(b.transactionTime) - new Date(a.transactionTime));
          setTxns(mine);
        }
      } catch {} finally { setLoading(false); }
    }
    load();
  }, [user]);

  const liveBalance = txns.length > 0 ? computeBalance(txns) : Number(wallet?.balance || 0);
  const totalEarned = txns.filter(t => t.transactionType === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
  const totalRefunded = txns.filter(t => t.transactionType === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);

  const txnColor = { CREDIT: 'var(--success)', DEBIT: 'var(--danger)', REFUND: 'var(--info)' };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  if (!wallet) return (
    <div className="page-wrapper page-enter">
      <h1 className="page-title" style={{ marginBottom: 24 }}>💰 My Earnings</h1>
      <div className="empty-state">
        <div className="empty-icon">💰</div>
        <div className="empty-title">No wallet found</div>
        <div className="empty-desc">Your earnings wallet will be created automatically when you receive your first booking payment.</div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 My Earnings</h1>
          <p className="page-subtitle">Revenue from your parking spots (after 10% platform fee)</p>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card highlight">
          <div className="stat-label">Current Balance</div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>₹{liveBalance.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Earned (gross)</div>
          <div className="stat-value" style={{ color: 'var(--success)', fontSize: '1.5rem' }}>₹{totalEarned.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Refunds / Reversals</div>
          <div className="stat-value" style={{ color: 'var(--danger)', fontSize: '1.5rem' }}>₹{totalRefunded.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{txns.length}</div>
        </div>
      </div>

      <h2 style={{ marginBottom: 16 }}>Transaction History</h2>
      {txns.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🧾</div><div className="empty-title">No transactions yet</div></div>
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
                  <td><span style={{ fontWeight: 700, color: txnColor[t.transactionType] }}>{t.transactionType}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t.purpose || '—'}</td>
                  <td style={{ fontWeight: 700, color: txnColor[t.transactionType] }}>
                    {t.transactionType === 'DEBIT' ? '-' : '+'}₹{Number(t.amount).toFixed(2)}
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
