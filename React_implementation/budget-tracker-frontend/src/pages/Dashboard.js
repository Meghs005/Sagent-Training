import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [income, setIncome] = useState([])
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [goals, setGoals] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAll() {
      try {
        const [inc, exp, bud, gls, acc] = await Promise.all([
          api.getIncomeByUser(user.id),
          api.getExpensesByUser(user.id),
          api.getBudgetsByUser(user.id),
          api.getGoalsByUser(user.id),
          api.getAccountsByUser(user.id),
        ])
        setIncome(inc || [])
        setExpenses(exp || [])
        setBudgets(bud || [])
        setGoals(gls || [])
        setAccounts(acc || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [user.id])

  const totalIncome   = income.reduce((s, i) => s + (i.amount || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + (e.totalExpense || e.dailyExpense || 0), 0)
  const balance       = totalIncome - totalExpenses

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (loading) return (
    <div className="loading-spinner">
      <div className="spinner" />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h2>Good day, {user.name?.split(' ')[0]} 👋</h2>
        <p>Here's your financial overview</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon">↑</div>
          <div className="stat-label">Total Income</div>
          <div className="stat-value">{fmt(totalIncome)}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">↓</div>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{fmt(totalExpenses)}</div>
        </div>
        <div className={`stat-card ${balance >= 0 ? 'gold' : 'red'}`}>
          <div className="stat-icon">◎</div>
          <div className="stat-label">Balance</div>
          <div className="stat-value">{fmt(balance)}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">⬡</div>
          <div className="stat-label">Accounts</div>
          <div className="stat-value">{accounts.length}</div>
        </div>
      </div>

      {/* Two-column lower section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Recent Income */}
        <div className="card">
          <div className="section-header">
            <h3>Recent Income</h3>
            <Link to="/income" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>View All</Link>
          </div>
          {income.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">↑</div>
              <p>No income recorded yet</p>
            </div>
          ) : (
            income.slice(-4).reverse().map(i => (
              <div key={i.iId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{i.iType}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Income source</div>
                </div>
                <span className="badge badge-green">{fmt(i.amount)}</span>
              </div>
            ))
          )}
        </div>

        {/* Recent Expenses */}
        <div className="card">
          <div className="section-header">
            <h3>Recent Expenses</h3>
            <Link to="/expenses" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>View All</Link>
          </div>
          {expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">↓</div>
              <p>No expenses recorded yet</p>
            </div>
          ) : (
            expenses.slice(-4).reverse().map(e => (
              <div key={e.eId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{e.categoryExpense}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily: {fmt(e.dailyExpense)}</div>
                </div>
                <span className="badge badge-red">{fmt(e.totalExpense)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Budget Progress */}
      {budgets.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-header" style={{ marginBottom: 20 }}>
            <h3>Budget Limits</h3>
            <Link to="/budget" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>Manage</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {budgets.map(b => {
              const spent = expenses.filter(e => e.categoryExpense === b.categoryType)
                .reduce((s, e) => s + (e.totalExpense || 0), 0)
              const pct = Math.min((spent / b.bLimit) * 100, 100)
              const over = pct >= 100
              return (
                <div key={b.bId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.categoryType}</span>
                    <span style={{ fontSize: '0.8rem', color: over ? 'var(--red)' : 'var(--text-muted)' }}>
                      {fmt(spent)} / {fmt(b.bLimit)}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className={`progress-bar-fill ${over ? 'danger' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <h3>Savings Goals</h3>
            <Link to="/goals" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>View All</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {goals.slice(0, 4).map(g => (
              <div key={g.gId} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Goal Target</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--gold)', fontWeight: 700 }}>
                  {fmt(g.target)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Account: {g.account?.aNo || g.account?.aType || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
