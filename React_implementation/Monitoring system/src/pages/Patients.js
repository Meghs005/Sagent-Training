import React, { useState, useEffect, useCallback } from 'react';
import { PatientAPI } from '../services/api';
import Toast from '../components/Toast';

function PatientModal({ onSave, onClose }) {
  const [form, setForm] = useState({ pName:'', pAge:'', pGender:'Male', pContact:'' });
  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submit = e => {
    e.preventDefault();
    onSave({ pName: form.pName, pAge: parseInt(form.pAge), pGender: form.pGender, pContact: form.pContact });
  };
  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="modal">
        <div className="modal-title">Add New Patient</div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name (pName)</label>
            <input className="form-input" name="pName" value={form.pName} onChange={set} placeholder="Full name" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Age (pAge)</label>
              <input className="form-input" name="pAge" type="number" value={form.pAge} onChange={set} placeholder="Age" min="0" max="150" required />
            </div>
            <div className="form-group">
              <label className="form-label">Gender (pGender)</label>
              <select className="form-select" name="pGender" value={form.pGender} onChange={set}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Contact (pContact)</label>
            <input className="form-input" name="pContact" value={form.pContact} onChange={set} placeholder="Phone or email" required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Patient</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Doctor sees all patients
function DoctorPatientsView() {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [toast,    setToast]    = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    PatientAPI.getAll()
      .then(r => setPatients(Array.isArray(r.data) ? r.data : []))
      .catch(() => setToast({ message: 'Failed to load', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = data => {
    PatientAPI.create(data)
      .then(() => { setModal(false); setToast({ message: 'Patient added!', type: 'ok' }); load(); })
      .catch(() => setToast({ message: 'Failed to add', type: 'error' }));
  };

  const handleDelete = id => {
    if (!window.confirm('Delete this patient?')) return;
    PatientAPI.delete(id)
      .then(() => { setToast({ message: 'Patient deleted', type: 'ok' }); load(); })
      .catch(() => setToast({ message: 'Failed to delete', type: 'error' }));
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {modal  && <PatientModal onSave={handleSave} onClose={() => setModal(false)} />}
      <div className="section-header">
        <div className="section-title">All Patients</div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Patient</button>
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : patients.length === 0 ? (
        <div className="empty"><div className="empty-icon">👤</div><h3>No patients yet</h3><p>Click "Add Patient" to get started.</p></div>
      ) : (
        <div className="cards-grid">
          {patients.map(p => (
            <div className="card card-blue" key={p.pId}>
              <div className="card-head">
                <div><div className="card-id">Patient #{p.pId}</div><div className="card-name">{p.pName}</div></div>
                <span className={`badge ${p.pGender === 'Male' ? 'b-blue' : p.pGender === 'Female' ? 'b-purple' : 'b-gray'}`}>{p.pGender}</span>
              </div>
              <div className="card-fields">
                <div className="field"><span className="field-key">pName</span><span className="field-val">{p.pName}</span></div>
                <div className="field"><span className="field-key">pAge</span><span className="field-val">{p.pAge} years</span></div>
                <div className="field"><span className="field-key">pGender</span><span className="field-val">{p.pGender}</span></div>
                <div className="field"><span className="field-key">pContact</span><span className="field-val">{p.pContact}</span></div>
              </div>
              <div className="card-footer">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.pId)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Patient sees only their own profile
function PatientProfileView({ user }) {
  const [myPatient, setMyPatient] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);

  useEffect(() => {
    PatientAPI.getById(user.id)
      .then(r => setMyPatient(r.data))
      .catch(() => setToast({ message: 'Failed to load profile', type: 'error' }))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="section-header">
        <div className="section-title">My Profile</div>
      </div>
      {loading ? (
        <div className="loading"><div className="spinner" />Loading your profile...</div>
      ) : !myPatient ? (
        <div className="empty"><div className="empty-icon">👤</div><h3>Profile not found</h3></div>
      ) : (
        <div style={{ maxWidth: 500 }}>
          <div className="card card-blue">
            <div className="card-head">
              <div>
                <div className="card-id">Patient #{myPatient.pId}</div>
                <div className="card-name">{myPatient.pName}</div>
              </div>
              <span className={`badge ${myPatient.pGender === 'Male' ? 'b-blue' : myPatient.pGender === 'Female' ? 'b-purple' : 'b-gray'}`}>{myPatient.pGender}</span>
            </div>
            <div className="card-fields">
              <div className="field"><span className="field-key">Patient ID</span><span className="field-val">#{myPatient.pId}</span></div>
              <div className="field"><span className="field-key">pName</span><span className="field-val">{myPatient.pName}</span></div>
              <div className="field"><span className="field-key">pAge</span><span className="field-val">{myPatient.pAge} years</span></div>
              <div className="field"><span className="field-key">pGender</span><span className="field-val">{myPatient.pGender}</span></div>
              <div className="field"><span className="field-key">pContact</span><span className="field-val">{myPatient.pContact}</span></div>
            </div>
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
            This is your personal profile. Contact admin to update your details.
          </p>
        </div>
      )}
    </div>
  );
}

// Main export — decides which view to show based on role
export default function Patients({ user }) {
  if (user.role === 'patient') {
    return <PatientProfileView user={user} />;
  }
  return <DoctorPatientsView />;
}
