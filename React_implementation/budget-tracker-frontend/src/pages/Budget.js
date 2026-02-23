import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Utilities', 'Health', 'Education', 'Other']

export default function Budget() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ categoryType: '', bLimit: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [bud, exp, inc] = await Promise.all([
        api.getBudgetsByUser(user.id),
        api.getExpensesByUser(user.id),
        api.getIncomeByUser(user.id),
      ])
      setBudgets(bud || [])
      setExpenses(exp || [])
      setIncome(inc || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [user.id])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      // Budget links to income — use first income entry or send with user nested
      const firstIncome = income[0]
      if (!firstIncome) {
        setError('Please add at least one income entry before creating a budget.')
        setSubmitting(false)
        return
      }
      await api.createBudget({
        categoryType: form.categoryType,
        bLimit: parseFloat(form.bLimit),
        income: { iId: firstIncome.iId }
      })
      setForm({ categoryType: '', bLimit: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return
    try {
      await api.deleteBudget(id)
      setBudgets(prev => prev.filter(b => b.bId !== id))
    } catch (e) { alert('Failed to delete') }
  }

  const getSpent = (category) =>
    expenses.filter(e => e.categoryExpense === category).reduce((s, e) => s + (e.totalExpense || 0), 0)

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h2>Budget Setting</h2>
        <p>Set monthly limits per category and track spending</p>
      </div>

      {/* Add Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18 }}>Create Budget Limit</h3>
        {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
        {income.length === 0 && (
          <div style={{ background: 'var(--gold-dim)', border: '1px solid rgba(200,169,110,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.85rem', color: 'var(--gold)', marginBottom: 16 }}>
            ⚠ You need at least one income entry to link a budget. Go to Income first.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <select value={form.categoryType} onChange={e => setForm({ ...form, categoryType: e.target.value })} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Monthly Limit (₹)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00"
                value={form.bLimit} onChange={e => setForm({ ...form, bLimit: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting || income.length === 0}>
            {submitting ? 'Creating...' : '+ Create Budget'}
          </button>
        </form>
      </div>

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <p>No budgets set yet. Create your first budget limit above.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {budgets.map(b => {
            const spent = getSpent(b.categoryType)
            const pct = b.bLimit > 0 ? Math.min((spent / b.bLimit) * 100, 100) : 0
            const over = spent > b.bLimit
            const remaining = b.bLimit - spent
            return (
              <div key={b.bId} className="card" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 2 }}>{b.categoryType}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly limit</div>
                  </div>
                  <button className="btn btn-danger" onClick={() => handleDelete(b.bId)} style={{ fontSize: '0.72rem', padding: '5px 10px' }}>✕</button>
                </div>

                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: over ? 'var(--red)' : 'var(--gold)', marginBottom: 4 }}>
                  {fmt(spent)}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>
                    {' '}/ {fmt(b.bLimit)}
                  </span>
                </div>

                <div className="progress-bar-container" style={{ marginBottom: 10 }}>
                  <div className={`progress-bar-fill ${over ? 'danger' : ''}`} style={{ width: `${pct}%` }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{pct.toFixed(0)}% used</span>
                  <span style={{ color: over ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                    {over ? `Over by ${fmt(Math.abs(remaining))}` : `${fmt(remaining)} left`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
