import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationAPI, courseAPI, documentAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Apply.css';

const STEPS = ['Personal Details', 'Documents', 'Fee Payment', 'Review & Submit'];

const Apply = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    DOB: '',
    address: '',
    percentage: '',
    subject: '',
    course_id: '',
    file: '',
    pay_method: 'Online',
  });

  useEffect(() => {
    courseAPI.getAll().then((res) => setCourses(res.data)).catch(console.error);
  }, []);

  const update = (field, val) => setFormData((p) => ({ ...p, [field]: val }));

  const next = () => { setError(''); setStep((s) => s + 1); };
  const prev = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Create document
      const docRes = await documentAPI.create({ file: formData.file || 'uploaded_document.pdf' });

      // 2. Build course ref
      const selectedCourse = courses.find((c) => String(c.course_id) === String(formData.course_id));

      // 3. Create application
      const appPayload = {
        name: formData.name,
        DOB: formData.DOB ? new Date(formData.DOB).toISOString() : null,
        address: formData.address,
        percentage: formData.percentage,
        subject: formData.subject,
        status: 'Under Review',
        document: { document_id: docRes.data.document_id },
        user: { user_id: currentUser.user_id },
        course: selectedCourse ? { course_id: selectedCourse.course_id } : null,
      };
      const appRes = await applicationAPI.create(appPayload);

      // 4. Create payment
      await paymentAPI.create({
        pay_method: formData.pay_method,
        status: 'Paid',
        application: { app_id: appRes.data.app_id },
      });

      navigate('/my-applications');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-page">
      <div className="apply-container">
        <div className="apply-header">
          <h1 className="page-title">New Application</h1>
          <p className="page-subtitle">Complete all steps to submit your application</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                <div className="step-num">{i < step ? '✓' : i + 1}</div>
                <div className="step-label">{label}</div>
              </div>
              {i < STEPS.length - 1 && <div className="step-line"></div>}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card apply-card">
          {step === 0 && (
            <div className="step-content">
              <h2 className="step-title-h">Personal & Academic Details</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={formData.name} onChange={(e) => update('name', e.target.value)} required placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={formData.DOB} onChange={(e) => update('DOB', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={formData.address} onChange={(e) => update('address', e.target.value)} rows={3} placeholder="123 Main St, City, State" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Percentage / GPA</label>
                  <input value={formData.percentage} onChange={(e) => update('percentage', e.target.value)} placeholder="e.g. 85% or 3.8 GPA" />
                </div>
                <div className="form-group">
                  <label>Primary Subject</label>
                  <input value={formData.subject} onChange={(e) => update('subject', e.target.value)} placeholder="e.g. Physics, Math, Commerce" />
                </div>
              </div>
              <div className="form-group">
                <label>Desired Course</label>
                <select value={formData.course_id} onChange={(e) => update('course_id', e.target.value)} required>
                  <option value="">-- Select a course --</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_type} ({c.duration})
                    </option>
                  ))}
                </select>
              </div>
              <div className="step-actions">
                <span></span>
                <button className="btn-primary" onClick={next} disabled={!formData.name || !formData.DOB || !formData.course_id}>
                  Next: Documents →
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="step-content">
              <h2 className="step-title-h">Document Upload</h2>
              <p className="step-desc">Upload your marksheet and ID proof. Accepted formats: PDF, JPG, PNG.</p>
              <div className="upload-area">
                <div className="upload-icon">📎</div>
                <p className="upload-label">Enter document filename / path</p>
                <div className="form-group" style={{ marginTop: '16px', width: '100%', maxWidth: '400px' }}>
                  <label>Document File Reference</label>
                  <input
                    value={formData.file}
                    onChange={(e) => update('file', e.target.value)}
                    placeholder="marksheet_john.pdf"
                  />
                </div>
              </div>
              <div className="step-actions">
                <button className="btn-secondary" onClick={prev}>← Back</button>
                <button className="btn-primary" onClick={next}>Next: Fee Payment →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h2 className="step-title-h">Fee Payment</h2>
              <div className="fee-box">
                <div className="fee-label">Application Fee</div>
                <div className="fee-amount">₹ 1,500</div>
              </div>
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label>Payment Method</label>
                <select value={formData.pay_method} onChange={(e) => update('pay_method', e.target.value)}>
                  <option value="Online">Online (Net Banking / UPI)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Demand Draft">Demand Draft</option>
                </select>
              </div>
              <div className="step-actions">
                <button className="btn-secondary" onClick={prev}>← Back</button>
                <button className="btn-primary" onClick={next}>Next: Review →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h2 className="step-title-h">Review & Submit</h2>
              <div className="review-grid">
                <div className="review-section">
                  <div className="review-label">Personal Details</div>
                  <div className="review-row"><span>Name</span><span>{formData.name}</span></div>
                  <div className="review-row"><span>DOB</span><span>{formData.DOB}</span></div>
                  <div className="review-row"><span>Address</span><span>{formData.address || '—'}</span></div>
                </div>
                <div className="review-section">
                  <div className="review-label">Academic</div>
                  <div className="review-row"><span>Percentage</span><span>{formData.percentage || '—'}</span></div>
                  <div className="review-row"><span>Subject</span><span>{formData.subject || '—'}</span></div>
                  <div className="review-row"><span>Course</span><span>{courses.find((c) => String(c.course_id) === String(formData.course_id))?.course_type || '—'}</span></div>
                </div>
                <div className="review-section">
                  <div className="review-label">Documents & Payment</div>
                  <div className="review-row"><span>Document</span><span>{formData.file || 'Not provided'}</span></div>
                  <div className="review-row"><span>Payment</span><span>{formData.pay_method}</span></div>
                  <div className="review-row"><span>Amount</span><span>₹ 1,500</span></div>
                </div>
              </div>
              <div className="step-actions">
                <button className="btn-secondary" onClick={prev}>← Back</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting…' : '✓ Submit Application'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Apply;
