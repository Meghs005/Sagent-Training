import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const statusBadge = (s) => {
  const m = { 'Under Review': 'badge-review', 'Accepted': 'badge-accepted', 'Rejected': 'badge-rejected' };
  return `badge ${m[s] || 'badge-pending'}`;
};

const MyApplications = () => {
  const { currentUser } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    applicationAPI.getAll()
      .then((res) => {
        const mine = res.data.filter((a) => a.user?.user_id === currentUser?.user_id);
        setApps(mine);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this application?')) return;
    await applicationAPI.delete(id);
    load();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">Track the status of all your submissions</p>
        </div>
        <Link to="/apply"><button className="btn-primary">+ New Application</button></Link>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner"></div>
        ) : apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No applications found.</p>
            <Link to="/apply"><button className="btn-primary" style={{ marginTop: '12px' }}>Apply Now</button></Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.app_id}>
                  <td><code>#{app.app_id}</code></td>
                  <td>{app.name}</td>
                  <td>{app.course?.course_type || '—'}</td>
                  <td>{app.percentage || '—'}</td>
                  <td><span className={statusBadge(app.status)}>{app.status || 'Submitted'}</span></td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/application/${app.app_id}`}>
                      <button className="btn-secondary btn-sm">View</button>
                    </Link>
                    {app.status !== 'Accepted' && (
                      <button className="btn-danger btn-sm" onClick={() => cancel(app.app_id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
