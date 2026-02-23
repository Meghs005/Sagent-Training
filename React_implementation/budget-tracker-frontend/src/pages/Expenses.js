import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'

const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Utilities', 'Health', 'Education', 'Other']

const CATEGORY_COLORS = {
  Food: 'badge-green', Travel: 'badge-blue', Shopping: 'badge-purple',
  Entertainment: 'badge-gold', Utilities: 'badge-red', Health: 'badge-green',
  Education: 'badge-blue', Other: 'badge-purple',
}

export default function Expenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ categoryExpense: '', dailyExpense: '', totalExpense: '', monthlyBalance: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await api.getExpensesByUser(user.id)
      setExpenses(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [user.id])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.createExpense({
        categoryExpense: form.categoryExpense,
        dailyExpense:    parseFloat(form.dailyExpense),
        totalExpense:    parseFloat(form.totalExpense),
        monthlyBalance:  parseFloat(form.monthlyBalance || 0),
        user: { id: user.id }
      })
      setForm({ categoryExpense: '', dailyExpense: '', totalExpense: '', monthlyBalance: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    try {
      await api.deleteExpense(id)
      setExpenses(prev => prev.filter(e => e.eId !== id))
    } catch (e) { alert('Failed to delete') }
  }

  const totalExpenses = expenses.reduce((s, e) => s + (e.totalExpense || 0), 0)
  const totalDaily    = expenses.reduce((s, e) => s + (e.dailyExpense || 0), 0)
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Category breakdown
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.categoryExpense] = (acc[e.categoryExpense] || 0) + (e.totalExpense || 0)
    return acc
  }, {})

  return (
    <div>
      <div className="page-header">
        <h2>Expense Logging</h2>
        <p>Track your daily and total spending across categories</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card red">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{fmt(totalExpenses)}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Daily Total</div>
          <div className="stat-value">{fmt(totalDaily)}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Entries</div>
          <div className="stat-value">{expenses.length}</div>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>Category Breakdown</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(byCategory).map(([cat, amt]) => (
              <div key={cat} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', minWidth: 120 }}>
                <div className={`badge ${CATEGORY_COLORS[cat] || 'badge-gold'}`} style={{ marginBottom: 6 }}>{cat}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{fmt(amt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18 }}>Log New Expense</h3>
        {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <select value={form.categoryExpense} onChange={e => setForm({ ...form, categoryExpense: e.target.value })} required>
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Daily Expense (₹)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00"
                value={form.dailyExpense} onChange={e => setForm({ ...form, dailyExpense: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Total Expense (₹)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00"
                value={form.totalExpense} onChange={e => setForm({ ...form, totalExpense: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Monthly Balance (₹)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00"
                value={form.monthlyBalance} onChange={e => setForm({ ...form, monthlyBalance: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Logging...' : '+ Log Expense'}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px 16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Expense History</h3>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">↓</div>
            <p>No expenses logged yet.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none', borderTop: '1px solid var(--border)' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Daily</th>
                  <th>Total</th>
                  <th>Monthly Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...expenses].reverse().map((e, idx) => (
                  <tr key={e.eId}>
                    <td style={{ color: 'var(--text-muted)' }}>{expenses.length - idx}</td>
                    <td><span className={`badge ${CATEGORY_COLORS[e.categoryExpense] || 'badge-gold'}`}>{e.categoryExpense}</span></td>
                    <td>{fmt(e.dailyExpense)}</td>
                    <td style={{ color: 'var(--red)', fontWeight: 600 }}>{fmt(e.totalExpense)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{fmt(e.monthlyBalance)}</td>
                    <td><button className="btn btn-danger" onClick={() => handleDelete(e.eId)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
