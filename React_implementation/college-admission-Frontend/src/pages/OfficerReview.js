import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import './OfficerReview.css';

const STATUSES = ['Under Review', 'Accepted', 'Rejected'];

const statusBadge = (s) => {
  const m = { 'Under Review': 'badge-review', 'Accepted': 'badge-accepted', 'Rejected': 'badge-rejected' };
  return `badge ${m[s] || 'badge-pending'}`;
};

const OfficerReview = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [updating, setUpdating] = useState(null);

  const load = () => {
    applicationAPI.getAll()
      .then((res) => setApps(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (app, newStatus) => {
    setUpdating(app.app_id);
    try {
      await applicationAPI.update(app.app_id, { ...app, status: newStatus });
      load();
    } catch (e) {
      alert('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'All' ? apps : apps.filter((a) => a.status === filter);

  const counts = {
    All: apps.length,
    'Under Review': apps.filter((a) => a.status === 'Under Review').length,
    'Accepted': apps.filter((a) => a.status === 'Accepted').length,
    'Rejected': apps.filter((a) => a.status === 'Rejected').length,
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Application Review</h1>
          <p className="page-subtitle">Review and update admission statuses</p>
        </div>
      </div>

      <div className="filter-tabs">
        {['All', ...STATUSES].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f} <span className="tab-count">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner"></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗂️</div>
            <p>No applications in this category.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Percentage</th>
                <th>Current Status</th>
                <th>Update Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.app_id}>
                  <td><code>#{app.app_id}</code></td>
                  <td>
                    <div className="student-name">{app.name}</div>
                    <div className="student-user">{app.user?.username}</div>
                  </td>
                  <td>{app.course?.course_type || '—'}</td>
                  <td>{app.percentage || '—'}</td>
                  <td><span className={statusBadge(app.status)}>{app.status || 'Submitted'}</span></td>
                  <td>
                    <select
                      className="status-select"
                      value={app.status || ''}
                      onChange={(e) => updateStatus(app, e.target.value)}
                      disabled={updating === app.app_id}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
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

export default OfficerReview;
