import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const libraryNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉', section: 'main' },
  { id: 'search', label: 'Browse Books', icon: '⊞', section: 'main' },
  { id: 'cart', label: 'My Cart', icon: '⊟', section: 'main', badge: true },
  { id: 'my-issues', label: 'My Issued Books', icon: '⊕', section: 'library' },
  { id: 'notifications', label: 'Notifications', icon: '◎', section: 'library' },
  { id: 'payment', label: 'Payments', icon: '◈', section: 'library' },
];

const librarianNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉', section: 'main' },
  { id: 'books', label: 'Book Inventory', icon: '⊞', section: 'main' },
  { id: 'issues', label: 'Issued Books', icon: '⊕', section: 'management' },
  { id: 'fines', label: 'Fine Management', icon: '◈', section: 'management' },
  { id: 'users', label: 'Users', icon: '◎', section: 'management' },
  { id: 'notifications', label: 'Notifications', icon: '⊟', section: 'management' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const isLibrarian = user?.role === 'LIBRARIAN' || user?.role === 'librarian';
  const navItems = isLibrarian ? librarianNavItems : libraryNavItems;

  const sections = ['main', 'library', 'management'];
  const sectionLabels = { main: 'Main', library: 'My Library', management: 'Management' };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-title">LibraryOS</div>
        <div className="logo-sub">{isLibrarian ? 'Librarian Portal' : 'Student Portal'}</div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => {
          const items = navItems.filter(n => n.section === section);
          if (!items.length) return null;
          return (
            <div key={section}>
              <div className="nav-section-label">{sectionLabels[section]}</div>
              {items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                  style={{ position: 'relative' }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.badge && cart.length > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: '#c0392b',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '1px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}>{cart.length}</span>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {(user?.name || user?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="name">{user?.name || user?.username}</div>
            <div className="role">{user?.role || 'student'}</div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm w-full" onClick={logout}
          style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
