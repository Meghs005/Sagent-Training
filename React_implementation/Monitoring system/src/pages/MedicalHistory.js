import React, { useState, useEffect, useCallback } from 'react';
import { MedicalHistoryAPI, PatientAPI, DoctorAPI, HealthRecordAPI } from '../services/api';
import Toast from '../components/Toast';

function Modal({ patients, doctors, healthRecords, onSave, onClose }) {
  const [pid,  setPid]  = useState('');
  const [did,  setDid]  = useState('');
  const [hrid, setHrid] = useState('');
  const submit = e => { e.preventDefault(); onSave({ patient: { pId: parseInt(pid) }, doctor: { dId: parseInt(did) }, healthRecord: { hId: parseInt(hrid) } }); };
  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="modal">
        <div className="modal-title">Add Medical History</div>
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
          <div className="form-group"><label className="form-label">Select Health Record</label>
            <select className="form-select" value={hrid} onChange={e => setHrid(e.target.value)} required>
              <option value="">-- Select Record --</option>
              {healthRecords.map(h => <option key={h.hId} value={h.hId}>#{h.hId} — {h.hType}: {h.hReadings}</option>)}
            </select>
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

export default function MedicalHistory({ user }) {
  const [allHist,       setAllHist]       = useState([]);
  const [patients,      setPatients]      = useState([]);
  const [doctors,       setDoctors]       = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [modal,         setModal]         = useState(false);
  const [toast,         setToast]         = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([MedicalHistoryAPI.getAll(), PatientAPI.getAll(), DoctorAPI.getAll(), HealthRecordAPI.getAll()])
      .then(([h, p, d, r]) => {
        setAllHist(Array.isArray(h.data) ? h.data : []);
        setPatients(Array.isArray(p.data) ? p.data : []);
        setDoctors(Array.isArray(d.data) ? d.data : []);
        setHealthRecords(Array.isArray(r.data) ? r.data : []);
      })
      .catch(() => setToast({ message: 'Failed to load', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter: patient sees only their own history, doctor sees only their own
  const histories = user.role === 'patient'
    ? allHist.filter(h => h.patient?.pId === user.id)
    : user.role === 'doctor'
    ? allHist.filter(h => h.doctor?.dId === user.id)
    : allHist;

  const handleSave = data => {
    MedicalHistoryAPI.create(data)
      .then(() => { setModal(false); setToast({ message: 'Medical history added!', type: 'ok' }); load(); })
      .catch(() => setToast({ message: 'Failed to add', type: 'error' }));
  };

  const handleDelete = id => {
    if (!window.confirm('Delete this medical history?')) return;
    MedicalHistoryAPI.delete(id)
      .then(() => { setToast({ message: 'Deleted', type: 'ok' }); load(); })
      .catch(() => setToast({ message: 'Failed to delete', type: 'error' }));
  };

  const title = user.role === 'patient' ? 'My Medical History' : 'All Medical Histories';

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {modal  && <Modal patients={patients} doctors={doctors} healthRecords={healthRecords} onSave={handleSave} onClose={() => setModal(false)} />}

      <div className="section-header">
        <div className="section-title">{title}</div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Medical History</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : histories.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🗂️</div>
          <h3>No medical history yet</h3>
          <p>{user.role === 'patient' ? 'You have no medical history recorded.' : 'No medical histories found.'}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {histories.map(h => (
            <div className="card card-red" key={h.mId}>
              <div className="card-head">
                <div><div className="card-id">History #{h.mId}</div><div className="card-name">{h.patient ? h.patient.pName : 'History #' + h.mId}</div></div>
                <span className="badge b-red">Medical</span>
              </div>
              <div className="card-fields">
                <div className="field"><span className="field-key">mId</span><span className="field-val">{h.mId}</span></div>
                {h.patient      && <div className="field"><span className="field-key">Patient</span><span className="field-val">{h.patient.pName} (#{h.patient.pId})</span></div>}
                {h.doctor       && <div className="field"><span className="field-key">Doctor</span><span className="field-val">{h.doctor.dName} — {h.doctor.dSpeciality}</span></div>}
                {h.healthRecord && <div className="field"><span className="field-key">Record</span><span className="field-val">{h.healthRecord.hType}: <strong style={{color:'#0369a1'}}>{h.healthRecord.hReadings}</strong></span></div>}
              </div>
              <div className="card-footer">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.mId)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
