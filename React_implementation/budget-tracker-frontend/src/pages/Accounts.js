import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'

const ACCOUNT_TYPES = ['Savings', 'Current', 'Salary', 'Fixed Deposit', 'Recurring Deposit', 'Wallet']

export default function Accounts() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ aType: '', aNo: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await api.getAccountsByUser(user.id)
      setAccounts(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [user.id])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.createAccount({
        aType: form.aType,
        aNo:   form.aNo,
        user:  { id: user.id }
      })
      setForm({ aType: '', aNo: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this account? This may affect linked goals.')) return
    try {
      await api.deleteAccount(id)
      setAccounts(prev => prev.filter(a => a.aId !== id))
    } catch (e) { alert('Failed to delete') }
  }

  const TYPE_ICON = {
    Savings: '🏦', Current: '🏢', Salary: '💼', 'Fixed Deposit': '🔒', 'Recurring Deposit': '🔄', Wallet: '👛'
  }

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h2>Accounts</h2>
        <p>Manage your linked bank accounts and wallets</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 28 }}>
        <div className="stat-card blue">
          <div className="stat-label">Total Accounts</div>
          <div className="stat-value">{accounts.length}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Account Types</div>
          <div className="stat-value">{new Set(accounts.map(a => a.aType)).size}</div>
        </div>
      </div>

      {/* Add Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18 }}>Add New Account</h3>
        {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Account Type</label>
              <select value={form.aType} onChange={e => setForm({ ...form, aType: e.target.value })} required>
                <option value="">Select type</option>
                {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input type="text" placeholder="e.g. XXXX XXXX 1234"
                value={form.aNo} onChange={e => setForm({ ...form, aNo: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : '+ Add Account'}
          </button>
        </form>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <p>No accounts added yet. Add your first account above.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {accounts.map(a => (
            <div key={a.aId} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <span style={{ fontSize: '2rem' }}>{TYPE_ICON[a.aType] || '🏦'}</span>
                <button className="btn btn-danger" onClick={() => handleDelete(a.aId)} style={{ fontSize: '0.72rem', padding: '5px 10px' }}>✕</button>
              </div>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 8 }}>{a.aType}</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: 8, letterSpacing: '0.05em' }}>
                  {a.aNo}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Account #{a.aId}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
