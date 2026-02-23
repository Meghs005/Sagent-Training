import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { to: '/income',    icon: '↑', label: 'Income' },
  { to: '/expenses',  icon: '↓', label: 'Expenses' },
  { to: '/budget',    icon: '◎', label: 'Budget' },
  { to: '/goals',     icon: '◈', label: 'Goals' },
  { to: '/accounts',  icon: '⬡', label: 'Accounts' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>FinTrack</h1>
        <span>Personal Finance</span>
      </div>

      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-name">{user.name}</div>
          <div className="sidebar-user-email">{user.email}</div>
        </div>
      )}

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">⏻</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
