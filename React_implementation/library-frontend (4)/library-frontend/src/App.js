import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import LibrarianPortal from './pages/LibrarianPortal';
import StudentPortal from './pages/StudentPortal';
import Chatbot from './components/Chatbot';
import './App.css';

function AppInner() {
  const { setUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (u) => {
    setUser(u);
    setCurrentUser(u);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const isLibrarian = currentUser.role === 'LIBRARIAN' || currentUser.role === 'ADMIN';

  const roleBadgeClass = {
    ADMIN: 'badge-admin',
    LIBRARIAN: 'badge-librarian',
    MEMBER: 'badge-member',
  }[currentUser.role] || 'badge-member';

  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">📚</span>
            <span className="brand-name">LibrariumOS</span>
          </div>
          <div className="sidebar-portal-badge">
            {isLibrarian ? '🧑‍💼 Librarian Portal' : '🎓 Student Portal'}
          </div>
          <div className="sidebar-user" style={{ marginTop: 'auto' }}>
            <div className="sidebar-user-info">
              <div className="sidebar-avatar">
                {currentUser.role === 'LIBRARIAN' ? '🧑‍💼' : currentUser.role === 'ADMIN' ? '🛡️' : '🎓'}
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">{currentUser.name || currentUser.username}</div>
                <span className={`badge ${roleBadgeClass}`}>{currentUser.role}</span>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout} title="Logout">⏻</button>
          </div>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="*" element={
              isLibrarian
                ? <LibrarianPortal currentUser={currentUser} />
                : <StudentPortal currentUser={currentUser} />
            } />
          </Routes>
        </main>
        <Chatbot />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

