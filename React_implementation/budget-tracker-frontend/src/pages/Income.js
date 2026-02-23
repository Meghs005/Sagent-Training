import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'

const INCOME_TYPES = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Gift', 'Other']

export default function Income() {
  const { user } = useAuth()
  const [income, setIncome] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ iType: '', amount: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const data = await api.getIncomeByUser(user.id)
      setIncome(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [user.id])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.createIncome({
        iType: form.iType,
        amount: parseFloat(form.amount),
        user: { id: user.id }
      })
      setForm({ iType: '', amount: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this income entry?')) return
    try {
      await api.deleteIncome(id)
      setIncome(prev => prev.filter(i => i.iId !== id))
    } catch (e) { alert('Failed to delete') }
  }

  const total = income.reduce((s, i) => s + (i.amount || 0), 0)
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div>
      <div className="page-header">
        <h2>Income Tracking</h2>
        <p>Record and monitor all your income sources</p>
      </div>

      {/* Total */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
        <div className="stat-card green">
          <div className="stat-label">Total Income</div>
          <div className="stat-value">{fmt(total)}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">Entries</div>
          <div className="stat-value">{income.length}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Average</div>
          <div className="stat-value">{income.length ? fmt(total / income.length) : '₹0.00'}</div>
        </div>
      </div>

      {/* Add Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 18 }}>Add New Income</h3>
        {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Income Type</label>
              <select value={form.iType} onChange={e => setForm({ ...form, iType: e.target.value })} required>
                <option value="">Select type</option>
                {INCOME_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Adding...' : '+ Add Income'}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px 16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Income History</h3>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : income.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">↑</div>
            <p>No income recorded yet. Add your first entry above.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ borderRadius: 0, border: 'none', borderTop: '1px solid var(--border)' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...income].reverse().map((i, idx) => (
                  <tr key={i.iId}>
                    <td style={{ color: 'var(--text-muted)' }}>{income.length - idx}</td>
                    <td>
                      <span className="badge badge-green">{i.iType}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', color: 'var(--green)', fontSize: '1rem' }}>
                      {fmt(i.amount)}
                    </td>
                    <td>
                      <button className="btn btn-danger" onClick={() => handleDelete(i.iId)}>Delete</button>
                    </td>
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
