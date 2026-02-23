# FinTrack — Budget Tracker Frontend

A React frontend for the Personal Budget Tracker Spring Boot backend.

## Prerequisites
- Node.js 18+
- Spring Boot backend running on `http://localhost:8080`

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server (proxies API calls to :8080)
npm run dev
```

Open **http://localhost:5173** in your browser.

## Features
- **User Registration & Login** — JWT-free session stored in localStorage (user object)
- **Private Data** — All pages fetch data filtered by the logged-in user's ID
- **Dashboard** — Balance overview (Income − Expenses), recent transactions, budget progress bars, goals summary
- **Income Tracking** — Add/delete income entries by type (Salary, Freelance, etc.)
- **Expense Logging** — Log expenses with category, daily & total amounts; see category breakdown
- **Budget Setting** — Set monthly limits per category, visual progress with over-budget alerts
- **Goal Tracking** — Set savings targets linked to accounts
- **Accounts** — Add bank accounts / wallets

## API Proxy (vite.config.js)
All `/users`, `/income`, `/expenses`, `/budget`, `/goals`, `/accounts` requests are proxied to `http://localhost:8080`. Change this if your backend runs on a different port.

## Project Structure
```
src/
├── api/
│   └── api.js            # All fetch calls to Spring Boot
├── context/
│   └── AuthContext.jsx   # Global auth state (user login/logout)
├── components/
│   ├── Sidebar.jsx        # Navigation sidebar
│   └── ProtectedRoute.jsx # Route guard
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Income.jsx
│   ├── Expenses.jsx
│   ├── Budget.jsx
│   ├── Goals.jsx
│   └── Accounts.jsx
├── App.jsx               # Router setup
├── main.jsx              # Entry point
└── index.css             # All styles (CSS variables + components)
```

## Backend Entity Mapping
| Frontend Page | Backend Endpoint         | Repository Method          |
|---------------|--------------------------|----------------------------|
| Income        | `/income/by-user/{id}`   | `findByUserId`             |
| Expenses      | `/expenses/by-user/{id}` | `findByUserId`             |
| Budget        | `/budget/by-user/{id}`   | `findByIncomeUserId`       |
| Goals         | `/goals/by-user/{id}`    | `findByAccountUserId`      |
| Accounts      | `/accounts/by-user/{id}` | `findByUserId`             |

> **Budget note:** Budget entities are linked to `Income`, not directly to `User`. The app automatically uses the user's first income entry as the foreign key when creating a budget. Make sure to add income before setting budgets.

> **Goal note:** Goals are linked to `Account`. Add an account before creating goals.
