import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import BookSearchPage from './pages/BookSearchPage';
import CartPage from './pages/CartPage';
import MyIssuesPage from './pages/MyIssuesPage';
import NotificationsPage from './pages/NotificationsPage';
import PaymentPage from './pages/PaymentPage';
import LibrarianDashboard from './pages/LibrarianDashboard';
import BookManagementPage from './pages/BookManagementPage';
import IssuesManagementPage from './pages/IssuesManagementPage';
import FineManagementPage from './pages/FineManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import './index.css';

const pageNames = {
  dashboard: 'Dashboard',
  search: 'Browse Books',
  cart: 'My Cart',
  'my-issues': 'My Issued Books',
  notifications: 'Notifications',
  payment: 'Payments',
  books: 'Book Inventory',
  issues: 'Issued Books',
  fines: 'Fine Management',
  users: 'User Management',
};

function AppInner() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (!user) return <LoginPage />;

  const isLibrarian = user.role === 'LIBRARIAN' || user.role === 'librarian';

  const renderPage = () => {
    if (isLibrarian) {
      switch (activePage) {
        case 'dashboard': return <LibrarianDashboard onNavigate={setActivePage} />;
        case 'books': return <BookManagementPage />;
        case 'issues': return <IssuesManagementPage onNavigate={setActivePage} />;
        case 'fines': return <FineManagementPage />;
        case 'users': return <UserManagementPage />;
        case 'notifications': return <NotificationsPage />;
        default: return <LibrarianDashboard onNavigate={setActivePage} />;
      }
    } else {
      switch (activePage) {
        case 'dashboard': return <StudentDashboard onNavigate={setActivePage} />;
        case 'search': return <BookSearchPage onNavigate={setActivePage} />;
        case 'cart': return <CartPage onNavigate={setActivePage} />;
        case 'my-issues': return <MyIssuesPage onNavigate={setActivePage} />;
        case 'notifications': return <NotificationsPage />;
        case 'payment': return <PaymentPage onNavigate={setActivePage} />;
        default: return <StudentDashboard onNavigate={setActivePage} />;
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        <div className="main-topbar">
          <span className="page-name">{pageNames[activePage] || 'LibraryOS'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
              {isLibrarian ? '📚 Librarian' : '🎓 Student'} · {user.name || user.username}
            </span>
          </div>
        </div>
        <div className="main-body">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppInner />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
