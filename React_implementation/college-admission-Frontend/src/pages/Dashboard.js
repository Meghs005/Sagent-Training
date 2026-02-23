import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const statusBadge = (status) => {
  const map = {
    'Under Review': 'badge-review',
    'Accepted': 'badge-accepted',
    'Rejected': 'badge-rejected',
    'Submitted': 'badge-pending',
  };
  return `badge ${map[status] || 'badge-pending'}`;
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationAPI.getAll()
      .then((res) => {
        const mine = res.data.filter((a) => a.user?.user_id === currentUser?.user_id);
        setApplications(mine);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser]);

  const stats = [
    { label: 'Applications', value: applications.length },
    { label: 'Under Review', value: applications.filter((a) => a.status === 'Under Review').length },
    { label: 'Accepted', value: applications.filter((a) => a.status === 'Accepted').length },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Welcome, {currentUser?.name}</h1>
          <p className="page-subtitle">Here's your admission overview</p>
        </div>
        <Link to="/apply"><button className="btn-primary">+ New Application</button></Link>
      </div>

      <div className="stats-row">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-head">Your Applications</h2>
        {loading ? (
          <div className="spinner"></div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>No applications yet.</p>
            <Link to="/apply"><button className="btn-primary" style={{marginTop:'12px'}}>Apply Now</button></Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.app_id}>
                  <td><code>#{app.app_id}</code></td>
                  <td>{app.name}</td>
                  <td>{app.course?.course_type || '—'}</td>
                  <td><span className={statusBadge(app.status)}>{app.status || 'Submitted'}</span></td>
                  <td>
                    <Link to={`/application/${app.app_id}`}>
                      <button className="btn-secondary btn-sm">View</button>
                    </Link>
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

export default Dashboard;
