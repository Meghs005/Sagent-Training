import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notifyAPI } from '../services/api';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { addToast } = (window._toast || { addToast: () => {} });
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLibrarian = user?.role === 'LIBRARIAN' || user?.role === 'librarian';

  useEffect(() => {
    const fn = isLibrarian ? notifyAPI.getAll() : notifyAPI.getByUser(user.userId);
    fn.then(r => setNotifs(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user, isLibrarian]);

  const iconMap = (message = '') => {
    if (message.toLowerCase().includes('fine')) return { icon: '💰', bg: '#fee2e2' };
    if (message.toLowerCase().includes('return')) return { icon: '📬', bg: '#d1fae5' };
    if (message.toLowerCase().includes('due') || message.toLowerCase().includes('overdue')) return { icon: '⏰', bg: '#fef3c7' };
    return { icon: '🔔', bg: 'var(--amber-pale)' };
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{notifs.length} total messages</p>
        </div>
      </div>

      <div className="card">
        {notifs.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : notifs.map((n, idx) => {
          const { icon, bg } = iconMap(n.message);
          return (
            <div key={n.id} className="notification-item" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="notif-icon" style={{ background: bg }}>{icon}</div>
              <div className="notif-content" style={{ flex: 1 }}>
                <div className="desc">{n.message}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate)', marginTop: '0.25rem' }}>
                  {n.user && `To: ${n.user.name || n.user.username}`}
                  {n.bookIssue?.book && ` · Book: ${n.bookIssue.book.title}`}
                </div>
                <div className="time">{new Date(n.sentAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
