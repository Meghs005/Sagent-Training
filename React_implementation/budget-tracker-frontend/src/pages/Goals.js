import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'

export default function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ target: '', accountId: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [gls, acc] = await Promise.all([
        api.getGoalsByUser(user.id),
        api.getAccountsByUser(user.id),
      ])
      setGoals(gls || [])
      setAccounts(acc || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [user.id])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (!form.accountId) {
        setError('Please select an account.')
        setSubmitting(false)
        return
      }
      await api.createGoal({
        target: parseFloat(form.target),
        account: { aId: parseInt(form.accountId) }
      })
      setForm({ target: '', accountId: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return
    try {
      await api.deleteGoal(id)
      setGoals(prev => prev.filter(g => g.gId !== id))
    } catch (e) { alert('Failed to delete') }
  }

  const totalTarget = goals.reduce((s, g) => s + (g.target || 0), 0)
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h2>Goal Tracking</h2>
        <p>Set and monitor your savings goals</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
        <div className="stat-card gold">
          <div className="stat-label">Total Target</div>
          <div className="stat-value">{fmt(totalTarget)}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Active Goals</div>
          <div className="stat-value">{goals.length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Accounts Linked</div>
          <div className="stat-value">{new Set(goals.map(g => g.account?.aId)).size}</div>
        </div>
      </div>

      {/* Add Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18 }}>Add New Goal</h3>
        {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
        {accounts.length === 0 && (
          <div style={{ background: 'var(--gold-dim)', border: '1px solid rgba(200,169,110,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.85rem', color: 'var(--gold)', marginBottom: 16 }}>
            ⚠ You need at least one account to set a goal. Go to Accounts first.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Target Amount (₹)</label>
              <input type="number" min="0" step="0.01" placeholder="e.g. 50000"
                value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Linked Account</label>
              <select value={form.accountId} onChange={e => setForm({ ...form, accountId: e.target.value })} required>
                <option value="">Select account</option>
                {accounts.map(a => (
                  <option key={a.aId} value={a.aId}>
                    {a.aType} — {a.aNo}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting || accounts.length === 0}>
            {submitting ? 'Adding...' : '+ Add Goal'}
          </button>
        </form>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No goals set yet. Start by adding a savings goal above.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {goals.map(g => (
            <div key={g.gId} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: -30, right: -30, width: 100, height: 100,
                borderRadius: '50%', background: 'var(--gold-dim)', opacity: 0.6
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span className="badge badge-gold">Goal</span>
                <button className="btn btn-danger" onClick={() => handleDelete(g.gId)} style={{ fontSize: '0.72rem', padding: '4px 10px' }}>✕</button>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)', fontWeight: 700, marginBottom: 8 }}>
                {fmt(g.target)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target savings</div>
              {g.account && (
                <div style={{ marginTop: 14, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Linked Account</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{g.account.aType} — {g.account.aNo}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
