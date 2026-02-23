import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationAPI, paymentAPI } from '../services/api';
import './ApplicationDetail.css';

const statusBadge = (s) => {
  const m = { 'Under Review': 'badge-review', 'Accepted': 'badge-accepted', 'Rejected': 'badge-rejected' };
  return `badge ${m[s] || 'badge-pending'}`;
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationAPI.getById(id),
      paymentAPI.getAll(),
    ]).then(([appRes, payRes]) => {
      setApp(appRes.data);
      setPayments(payRes.data.filter((p) => p.application?.app_id === parseInt(id)));
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="dashboard-page"><div className="spinner"></div></div>;
  if (!app) return <div className="dashboard-page"><p>Application not found.</p></div>;

  return (
    <div className="dashboard-page">
      <div className="detail-header">
        <button className="btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 className="page-title">Application #{app.app_id}</h1>
          <p className="page-subtitle">Submitted by {app.user?.name}</p>
        </div>
        <span className={statusBadge(app.status)}>{app.status || 'Submitted'}</span>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3 className="section-head">Personal Details</h3>
          <div className="detail-list">
            <div className="detail-row"><span>Full Name</span><span>{app.name}</span></div>
            <div className="detail-row"><span>Date of Birth</span><span>{app.DOB ? new Date(app.DOB).toLocaleDateString() : '—'}</span></div>
            <div className="detail-row"><span>Address</span><span>{app.address || '—'}</span></div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-head">Academic Details</h3>
          <div className="detail-list">
            <div className="detail-row"><span>Percentage</span><span>{app.percentage || '—'}</span></div>
            <div className="detail-row"><span>Subject</span><span>{app.subject || '—'}</span></div>
            <div className="detail-row"><span>Desired Course</span><span>{app.course?.course_type || '—'}</span></div>
            <div className="detail-row"><span>Duration</span><span>{app.course?.duration || '—'}</span></div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-head">Documents</h3>
          <div className="detail-list">
            <div className="detail-row"><span>File</span><span>{app.document?.file || '—'}</span></div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-head">Payments</h3>
          {payments.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No payment records found.</p>
          ) : (
            <div className="detail-list">
              {payments.map((p) => (
                <div className="detail-row" key={p.fees_payment_id}>
                  <span>{p.pay_method}</span>
                  <span className="badge badge-accepted">{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
