import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import { useToast } from '../components/Toast';

export default function PaymentPage({ onNavigate }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [paidIds, setPaidIds] = useState([]);
  const [cardDetails, setCardDetails] = useState({ cardNum: '', expiry: '', cvv: '', name: '' });

  useEffect(() => {
    issueAPI.getByUser(user.userId).then(r => {
      const fined = r.data.filter(i => i.fineAmount && i.fineAmount > 0 && i.status !== 'PAID');
      setIssues(fined);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const totalFine = issues.reduce((sum, i) => sum + (i.fineAmount || 0), 0);

  const handlePay = async (issue) => {
    setPaying(issue.bookIssueId);
    try {
      await issueAPI.update(issue.bookIssueId, { ...issue, status: 'PAID' });
      setPaidIds(prev => [...prev, issue.bookIssueId]);
      setIssues(prev => prev.filter(i => i.bookIssueId !== issue.bookIssueId));
      addToast(`Fine of ₹${issue.fineAmount} paid successfully!`, 'success');
    } catch {
      addToast('Payment failed. Try again.', 'error');
    }
    setPaying(null);
  };

  const handlePayAll = async () => {
    for (const issue of issues) {
      await handlePay(issue);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  if (issues.length === 0 && paidIds.length === 0) {
    return (
      <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '0.75rem' }}>All Clear!</h2>
          <p style={{ color: 'var(--slate)', marginBottom: '1.5rem' }}>You have no pending fines. Enjoy your books!</p>
          <button className="btn btn-amber" onClick={() => onNavigate('search')}>Browse Books</button>
        </div>
      </div>
    );
  }

  if (paidIds.length > 0 && issues.length === 0) {
    return (
      <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎊</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '0.75rem' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--slate)', marginBottom: '2rem' }}>
            All your fines have been cleared. Your account is in good standing.
          </p>
          <button className="btn btn-amber" onClick={() => onNavigate('dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Centre</h1>
          <p className="page-subtitle">Clear your outstanding library fines</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Fine list */}
        <div className="card">
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3>Outstanding Fines</h3>
          </div>
          {issues.map(issue => (
            <div key={issue.bookIssueId} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{issue.book?.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate)', marginTop: '0.2rem' }}>
                  Due: {new Date(issue.dueDate).toLocaleDateString()}
                  {issue.returnDate && ` • Returned: ${new Date(issue.returnDate).toLocaleDateString()}`}
                </div>
                <span className={`badge ${issue.status === 'LOST' ? 'badge-red' : 'badge-amber'}`} style={{ marginTop: '0.375rem' }}>
                  {issue.status === 'LOST' ? 'Lost Book' : 'Late Return'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--crimson)' }}>₹{issue.fineAmount}</div>
                <button className="btn btn-forest btn-sm" style={{ marginTop: '0.5rem' }}
                  onClick={() => handlePay(issue)}
                  disabled={paying === issue.bookIssueId}>
                  {paying === issue.bookIssueId ? 'Processing...' : 'Pay'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Payment summary */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Payment Summary</h3>

          <div style={{ background: 'var(--paper)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--slate)' }}>
              <span>Outstanding Fines</span>
              <span>{issues.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--crimson)' }}>₹{totalFine.toFixed(2)}</span>
            </div>
          </div>

          {/* Mock card form */}
          <div className="form-group">
            <label className="form-label">Cardholder Name</label>
            <input className="input-field" placeholder="John Doe"
              value={cardDetails.name} onChange={e => setCardDetails(d => ({ ...d, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Card Number</label>
            <input className="input-field" placeholder="1234 5678 9012 3456" maxLength={19}
              value={cardDetails.cardNum} onChange={e => setCardDetails(d => ({ ...d, cardNum: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Expiry</label>
              <input className="input-field" placeholder="MM/YY"
                value={cardDetails.expiry} onChange={e => setCardDetails(d => ({ ...d, expiry: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">CVV</label>
              <input className="input-field" placeholder="123" maxLength={3}
                value={cardDetails.cvv} onChange={e => setCardDetails(d => ({ ...d, cvv: e.target.value }))} />
            </div>
          </div>

          <button className="btn btn-forest btn-lg w-full" onClick={handlePayAll} disabled={!!paying}>
            {paying ? 'Processing...' : `Pay All — ₹${totalFine.toFixed(2)}`}
          </button>

          <div style={{ fontSize: '0.75rem', color: 'var(--slate)', textAlign: 'center', marginTop: '0.75rem' }}>
            🔒 Payments are processed securely
          </div>
        </div>
      </div>
    </div>
  );
}
