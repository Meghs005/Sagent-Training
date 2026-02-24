import React from 'react';
const MENU = [
  { section: 'Overview',  items: [{ key: 'dashboard', label: 'Dashboard', icon: '🏠' }] },
  { section: 'Entities',  items: [{ key: 'patients', label: 'Patients', icon: '👤' }, { key: 'doctors', label: 'Doctors', icon: '🩺' }, { key: 'consultations', label: 'Consultations', icon: '💬' }] },
  { section: 'Records',   items: [{ key: 'healthrecords', label: 'Health Records', icon: '📋' }, { key: 'medicalhistory', label: 'Medical History', icon: '🗂️' }] },
];
export default function Sidebar({ active, onNav, user, onLogout }) {
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '?';
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><h1>MediTrack</h1><p>Patient Monitoring System</p></div>
      {user && (
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div><div className="user-name">{user.name}</div><div className="user-role">{user.role === 'patient' ? '👤 Patient' : '🩺 Doctor'}</div></div>
        </div>
      )}
      <nav className="sidebar-menu">
        {MENU.map(group => (
          <React.Fragment key={group.section}>
            <div className="menu-label">{group.section}</div>
            {group.items.map(item => (
              <button key={item.key} className={`menu-btn ${active === item.key ? 'active' : ''}`} onClick={() => onNav(item.key)}>
                <span className="menu-icon">{item.icon}</span>{item.label}
              </button>
            ))}
          </React.Fragment>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>🚪 Logout</button>
      </div>
    </aside>
  );
}
