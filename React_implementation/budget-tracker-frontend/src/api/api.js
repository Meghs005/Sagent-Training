const BASE_URL = ''  // proxied via vite to http://localhost:8080

async function request(url, options = {}) {
  const res = await fetch(BASE_URL + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// ── Users ──────────────────────────────────────────────────────────────
export const api = {
  // Users
  register: (data)           => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  login:    (email, password)=> request('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getUser:  (id)             => request(`/users/${id}`),
  updateUser:(id, data)      => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Income
  getIncomeByUser: (uid)     => request(`/income/by-user/${uid}`),
  createIncome:   (data)     => request('/income', { method: 'POST', body: JSON.stringify(data) }),
  deleteIncome:   (id)       => request(`/income/${id}`, { method: 'DELETE' }),

  // Expenses
  getExpensesByUser: (uid)   => request(`/expenses/by-user/${uid}`),
  createExpense:    (data)   => request('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense:    (id)     => request(`/expenses/${id}`, { method: 'DELETE' }),

  // Budget
  getBudgetsByUser: (uid)    => request(`/budget/by-user/${uid}`),
  createBudget:    (data)    => request('/budget', { method: 'POST', body: JSON.stringify(data) }),
  deleteBudget:    (id)      => request(`/budget/${id}`, { method: 'DELETE' }),

  // Goals
  getGoalsByUser: (uid)      => request(`/goals/by-user/${uid}`),
  createGoal:    (data)      => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  deleteGoal:    (id)        => request(`/goals/${id}`, { method: 'DELETE' }),

  // Accounts
  getAccountsByUser: (uid)   => request(`/accounts/by-user/${uid}`),
  createAccount:    (data)   => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  deleteAccount:    (id)     => request(`/accounts/${id}`, { method: 'DELETE' }),
}
