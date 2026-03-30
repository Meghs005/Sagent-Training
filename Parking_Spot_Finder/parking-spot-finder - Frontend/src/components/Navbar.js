import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const NAV_ITEMS = {
  USER: [
    { path: '/dashboard',     label: 'Dashboard',  icon: '⊞' },
    { path: '/search',        label: 'Find Parking',icon: '⌖' },
    { path: '/bookings',      label: 'My Bookings', icon: '📋' },
    { path: '/vehicles',      label: 'Vehicles',    icon: '🚗' },
    { path: '/wallet',        label: 'Wallet',      icon: '💳' },
  ],
  SPOT_LENDER: [
    { path: '/dashboard',         label: 'Dashboard',   icon: '⊞' },
    { path: '/lender/my-spots',   label: 'My Spots',    icon: '🅿' },
    { path: '/lender/add-spot',   label: 'Add Spot',    icon: '+' },
    { path: '/lender/my-slots',   label: 'My Slots',    icon: '⋮' },
  ],
  ADMIN: [
    { path: '/dashboard',         label: 'Dashboard',  icon: '⊞' },
    { path: '/admin/spots',       label: 'Approve Spots', icon: '✓' },
    { path: '/admin/bookings',    label: 'All Bookings', icon: '📋' },
    { path: '/admin/locations',   label: 'Locations',  icon: '📍' },
    { path: '/admin/users',       label: 'Users',      icon: '👥' },
    { path: '/admin/revenue',     label: 'Revenue',    icon: '📊' },
    { path: '/admin/pricing',     label: 'Pricing',    icon: '💲' },
    { path: '/admin/pricing',     label: 'Pricing',    icon: '💰' },
  ],
};

export default function Navbar() {
  const { user, logout, isAdmin, isLender, isUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const role = isAdmin ? 'ADMIN' : isLender ? 'SPOT_LENDER' : isUser ? 'USER' : null;
  const navItems = role ? NAV_ITEMS[role] : [];

  const roleBadge = { USER: 'User', SPOT_LENDER: 'Lender', ADMIN: 'Admin' };
  const roleColor = { USER: '#00d4aa', SPOT_LENDER: '#7c3aed', ADMIN: '#f59e0b' };

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/search'} className="nav-logo">
          <span className="nav-logo-icon">🅿</span>
          <span className="nav-logo-text">Park<span>Ease</span></span>
        </Link>

        {/* Desktop Links */}
        {user && (
          <div className="nav-links">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-link-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              <div className="nav-user-info">
                <span className="nav-user-name">{user.name || user.email}</span>
                {role && (
                  <span className="nav-user-role" style={{ color: roleColor[role] }}>
                    {roleBadge[role]}
                  </span>
                )}
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth-btns">
              <Link to="/login"    className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div className="mobile-menu">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`mobile-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ margin: '8px 16px' }}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
