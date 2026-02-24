import React, { useState, useEffect, useCallback } from 'react';
import { ConsultationAPI, PatientAPI, DoctorAPI } from '../services/api';
import Toast from '../components/Toast';

function Modal({ patients, doctors, onSave, onClose }) {
  const [pid, setPid] = useState('');
  const [did, setDid] = useState('');
  const [fb,  setFb]  = useState('');
  const submit = e => { e.preventDefault(); onSave({ feedback: fb, patient: { pId: parseInt(pid) }, doctor: { dId: parseInt(did) } }); };
  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="modal">
        <div className="modal-title">New Consultation</div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Select Patient</label>
            <select className="form-select" value={pid} onChange={e => setPid(e.target.value)} required>
              <option value="">-- Select Patient --</option>
              {patients.map(p => <option key={p.pId} value={p.pId}>{p.pName} (#{p.pId})</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Select Doctor</label>
            <select className="form-select" value={did} onChange={e => setDid(e.target.value)} required>
              <option value="">-- Select Doctor --</option>
              {doctors.map(d => <option key={d.dId} value={d.dId}>{d.dName} — {d.dSpeciality} (#{d.dId})</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Feedback / Notes</label>
            <input className="form-input" value={fb} onChange={e => setFb(e.target.value)} placeholder="Consultation notes" required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Consultations({ user }) {
  const [allCons,  setAllCons]  = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [toast,    setToast]    = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([ConsultationAPI.getAll(), PatientAPI.getAll(), DoctorAPI.getAll()])
      .then(([c, p, d]) => {
        setAllCons(Array.isArray(c.data) ? c.data : []);
        setPatients(Array.isArray(p.data) ? p.data : []);
        setDoctors(Array.isArray(d.data) ? d.data : []);
      })
      .catch(() => setToast({ message: 'Failed to load', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter based on role
  const consultations = user.role === 'patient'
    ? allCons.filter(c => c.patient?.pId === user.id)
    : user.role === 'doctor'
    ? allCons.filter(c => c.doctor?.dId === user.id)
    : allCons;

  const handleSave = data => {
    ConsultationAPI.create(data)
      .then(() => { setModal(false); setToast({ message: 'Consultation created!', type: 'ok' }); load(); })
      .catch(() => setToast({ message: 'Failed to create', type: 'error' }));
  };

  const handleDelete = id => {
    if (!window.confirm('Delete this consultation?')) return;
    ConsultationAPI.delete(id)
      .then(() => { setToast({ message: 'Deleted', type: 'ok' }); load(); })
      .catch(() => setToast({ message: 'Failed to delete', type: 'error' }));
  };

  const title = user.role === 'patient' ? 'My Consultations' : user.role === 'doctor' ? 'My Consultations' : 'All Consultations';

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {modal  && <Modal patients={patients} doctors={doctors} onSave={handleSave} onClose={() => setModal(false)} />}

      <div className="section-header">
        <div className="section-title">{title}</div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ New Consultation</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : consultations.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">💬</div>
          <h3>No consultations yet</h3>
          <p>{user.role === 'patient' ? 'You have no consultations recorded.' : 'No consultations found.'}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {consultations.map(c => (
            <div className="card card-green" key={c.aId}>
              <div className="card-head">
                <div><div className="card-id">Consultation #{c.aId}</div><div className="card-name">Consultation #{c.aId}</div></div>
                <span className="badge b-green">Active</span>
              </div>
              <div className="card-fields">
                <div className="field"><span className="field-key">feedback</span><span className="field-val">{c.feedback || '—'}</span></div>
                {c.patient && <div className="field"><span className="field-key">Patient</span><span className="field-val">{c.patient.pName} (#{c.patient.pId})</span></div>}
                {c.doctor  && <div className="field"><span className="field-key">Doctor</span><span className="field-val">{c.doctor.dName}</span></div>}
                {c.doctor  && <div className="field"><span className="field-key">Speciality</span><span className="field-val">{c.doctor.dSpeciality}</span></div>}
              </div>
              <div className="card-footer">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.aId)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
