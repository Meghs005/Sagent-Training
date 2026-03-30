import React, { useState, useEffect } from 'react';
import { walletAPI, transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Wallet() {
  const { user } = useAuth();
  const [wallet,       setWallet]       = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [topupAmt,     setTopupAmt]     = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [msg,          setMsg]          = useState({ text: '', type: 'info' });

  /* ── Compute true balance from all transactions ───────────────── */
  const computeBalance = (txns) => {
    return txns.reduce((acc, t) => {
      const amt = Number(t.amount) || 0;
      if (t.transactionType === 'CREDIT' || t.transactionType === 'REFUND') return acc + amt;
      if (t.transactionType === 'DEBIT') return acc - amt;
      return acc;
    }, 0);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [wRes, tRes] = await Promise.all([walletAPI.getAll(), transactionAPI.getAll()]);
      const myWallet = (wRes.data || []).find(w => w.user?.userId === user.userId);
      setWallet(myWallet || null);

      if (myWallet) {
        const myTxns = (tRes.data || [])
          .filter(t => t.wallet?.walletId === myWallet.walletId)
          .sort((a, b) => new Date(b.transactionTime) - new Date(a.transactionTime));
        setTransactions(myTxns);

        /* Patch the wallet balance in the DB to match real computed value */
        const realBalance = computeBalance(myTxns);
        if (Math.abs(Number(myWallet.balance) - realBalance) > 0.01) {
          try {
            await api.put(`/wallets/${myWallet.walletId}`, {
              ...myWallet,
              balance: realBalance,
              lastUpdated: new Date().toISOString(),
            });
          } catch { /* PUT may not exist yet — handled by backend fix */ }
          /* Update locally even if backend PUT fails */
          setWallet(w => ({ ...w, balance: realBalance }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [user]);

  const createWallet = async () => {
    try {
      await walletAPI.create({ user: { userId: user.userId }, balance: 0, lastUpdated: new Date().toISOString() });
      await load();
    } catch (err) {
      setMsg({ text: 'Failed to create wallet: ' + (err.response?.data?.message || 'error'), type: 'error' });
    }
  };

  const handleTopup = async () => {
    if (!topupAmt || Number(topupAmt) <= 0) {
      setMsg({ text: 'Please enter a valid amount.', type: 'error' });
      return;
    }
    if (!wallet) { setMsg({ text: 'No wallet found.', type: 'error' }); return; }

    setTopupLoading(true);
    setMsg({ text: '', type: 'info' });
    try {
      const amt = Number(topupAmt);

      /* 1. Create the transaction record */
      await transactionAPI.create({
        wallet:            { walletId: wallet.walletId },
        amount:            amt,
        transactionType:   'CREDIT',
        purpose:           'WALLET_TOPUP',
        transactionStatus: 'SUCCESS',
        transactionTime:   new Date().toISOString(),
      });

      /* 2. Reload transactions and re-compute balance */
      const tRes   = await transactionAPI.getAll();
      const myTxns = (tRes.data || [])
        .filter(t => t.wallet?.walletId === wallet.walletId)
        .sort((a, b) => new Date(b.transactionTime) - new Date(a.transactionTime));
      const newBalance = computeBalance(myTxns);
      setTransactions(myTxns);

      /* 3. Persist new balance to backend */
      try {
        await api.put(`/wallets/${wallet.walletId}`, {
          ...wallet,
          balance:     newBalance,
          lastUpdated: new Date().toISOString(),
        });
      } catch { /* backend PUT not yet added — balance shown from computation */ }

      setWallet(w => ({ ...w, balance: newBalance, lastUpdated: new Date().toISOString() }));
      setTopupAmt('');
      setMsg({ text: `₹${amt} added successfully! New balance: ₹${newBalance.toFixed(2)}`, type: 'success' });
      setTimeout(() => setMsg({ text: '', type: 'info' }), 4000);
    } catch {
      setMsg({ text: 'Top-up failed. Please try again.', type: 'error' });
    } finally { setTopupLoading(false); }
  };

  /* Derive live balance from transactions (always correct) */
  const liveBalance = transactions.length > 0 ? computeBalance(transactions) : Number(wallet?.balance || 0);

  const txnTypeColor  = { CREDIT: 'var(--success)', DEBIT: 'var(--danger)', REFUND: 'var(--info)' };
  const txnTypePrefix = { CREDIT: '+', DEBIT: '-', REFUND: '+' };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  if (!wallet) {
    return (
      <div className="page-wrapper page-enter">
        <h1 className="page-title" style={{ marginBottom: 24 }}>💳 My Wallet</h1>
        <div className="empty-state">
          <div className="empty-icon">💳</div>
          <div className="empty-title">No wallet found</div>
          <div className="empty-desc">Create a wallet to manage payments for parking bookings</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={createWallet}>
            + Create Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">💳 My Wallet</h1>
          <p className="page-subtitle">Wallet ID #{wallet.walletId}</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : msg.type === 'error' ? 'error' : 'info'}`}
          style={{ marginBottom: 20 }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Balance Card */}
        <div className="card" style={{
          borderColor: liveBalance < 0 ? 'rgba(239,68,68,0.4)' : 'rgba(0,212,170,0.4)',
          background: liveBalance < 0
            ? 'linear-gradient(135deg, var(--bg-card), rgba(239,68,68,0.06))'
            : 'linear-gradient(135deg, var(--bg-card), rgba(0,212,170,0.06))',
        }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Available Balance
          </div>
          <div style={{
            fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)',
            color: liveBalance < 0 ? 'var(--danger)' : 'var(--primary)'
          }}>
            ₹{liveBalance.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Last updated: {wallet.lastUpdated ? new Date(wallet.lastUpdated).toLocaleString() : 'N/A'}
          </div>
          {/* Transaction summary */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Credited</div>
              <div style={{ fontWeight: 700, color: 'var(--success)' }}>
                +₹{transactions.filter(t => t.transactionType === 'CREDIT' || t.transactionType === 'REFUND')
                  .reduce((s, t) => s + Number(t.amount), 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Debited</div>
              <div style={{ fontWeight: 700, color: 'var(--danger)' }}>
                -₹{transactions.filter(t => t.transactionType === 'DEBIT')
                  .reduce((s, t) => s + Number(t.amount), 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Top-up Card */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Add Money</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {[100, 200, 500, 1000].map(amt => (
              <button key={amt}
                className={`btn btn-sm ${Number(topupAmt) === amt ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTopupAmt(String(amt))}>
                ₹{amt}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="number" min="1" placeholder="Custom amount"
              className="form-input"
              value={topupAmt}
              onChange={e => setTopupAmt(e.target.value)}
              style={{ flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && handleTopup()}
            />
            <button className="btn btn-primary" disabled={topupLoading} onClick={handleTopup}>
              {topupLoading ? '...' : 'Add ₹'}
            </button>
          </div>
          {topupAmt && Number(topupAmt) > 0 && (
            <div style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              After top-up: <strong style={{ color: 'var(--primary)' }}>₹{(liveBalance + Number(topupAmt)).toFixed(2)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Transactions */}
      <h2 style={{ marginBottom: 16 }}>Transaction History</h2>
      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <div className="empty-title">No transactions yet</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Running Balance</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                /* Build running balance from oldest to newest then display newest first */
                const sorted = [...transactions].sort((a, b) => new Date(a.transactionTime) - new Date(b.transactionTime));
                let running = 0;
                const withBalance = sorted.map(t => {
                  const amt = Number(t.amount) || 0;
                  if (t.transactionType === 'CREDIT' || t.transactionType === 'REFUND') running += amt;
                  else if (t.transactionType === 'DEBIT') running -= amt;
                  return { ...t, runningBalance: running };
                });
                return withBalance.reverse().map(t => (
                  <tr key={t.transactionId}>
                    <td style={{ color: 'var(--text-muted)' }}>#{t.transactionId}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: txnTypeColor[t.transactionType] || 'var(--text-primary)' }}>
                        {t.transactionType}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.purpose || '—'}</td>
                    <td style={{ fontWeight: 700, color: txnTypeColor[t.transactionType] }}>
                      {txnTypePrefix[t.transactionType]}₹{Number(t.amount).toFixed(2)}
                    </td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                      ₹{t.runningBalance.toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${t.transactionStatus?.toUpperCase() === 'SUCCESS' ? 'badge-approved' : 'badge-pending'}`}>
                        {t.transactionStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {t.transactionTime ? new Date(t.transactionTime).toLocaleString() : '—'}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
