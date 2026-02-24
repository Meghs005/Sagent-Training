import React, { useState, useEffect, useCallback } from 'react';
import { HealthRecordAPI, PatientAPI } from '../services/api';
import Toast from '../components/Toast';

const HT = ['Blood Pressure','Blood Sugar','Heart Rate','Body Temperature','Oxygen Saturation','BMI','Cholesterol','Hemoglobin','Pulse Rate','Weight'];

function Modal({ patients, onSave, onClose }) {
  const [pid, setPid]           = useState('');
  const [hType, setHType]       = useState('');
  const [hReadings, setHReadings] = useState('');
  const submit = e => { e.preventDefault(); onSave({ hType, hReadings, patient: { pId: parseInt(pid) } }); };
  return (
    <div className="overlay" onClick={e => e.target.className === 'overlay' && onClose()}>
      <div className="modal">
        <div className="modal-title">Add Health Record</div>
        <form onSubmit={submit}>
          <div className="form-group"><label className="form-label">Select Patient</label>
            <select className="form-select" value={pid} onChange={e => setPid(e.target.value)} required>
              <option value="">-- Select Patient --</option>
              {patients.map(p => <option key={p.pId} value={p.pId}>{p.pName} (#{p.pId})</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Record Type (hType)</label>
            <select className="form-select" value={hType} onChange={e => setHType(e.target.value)} required>
              <option value="">-- Select Type --</option>
              {HT.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Readings (hReadings)</label>
            <input className="form-input" value={hReadings} onChange={e => setHReadings(e.target.value)} placeholder="e.g. 120/80 mmHg" required />
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

export default function HealthRecords({ user }) {
  const [allRecords, setAllRecords] = useState([]);
  const [patients,   setPatients]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [toast,      setToast]      = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([HealthRecordAPI.getAll(), PatientAPI.getAll()])
      .then(([r, p]) => {
        setAllRecords(Array.isArray(r.data) ? r.data : []);
        setPatients(Array.isArray(p.data) ? p.data : []);
      })
      .catch(() => setToast({ message: 'Failed to load', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter: patient sees only their own records
  const records = user.role === 'patient'
    ? allRecords.filter(r => r.patient?.pId === user.id)
    : allRecords;

  const handleSave = data => {
    HealthRecordAPI.create(data)
      .then(() => { setModal(false); setToast({ message: 'Health record added!', type: 'ok' }); load(); })
      .catch(() => setToast({ message: 'Failed to add', type: 'error' }));
  };

  const handleDelete = id => {
    if (!window.confirm('Delete this health record?')) return;
    HealthRecordAPI.delete(id)
      .then(() => { setToast({ message: 'Deleted', type: 'ok' }); load(); })
      .catch(() => setToast({ message: 'Failed to delete', type: 'error' }));
  };

  const title = user.role === 'patient' ? 'My Health Records' : 'All Health Records';

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {modal  && <Modal patients={patients} onSave={handleSave} onClose={() => setModal(false)} />}

      <div className="section-header">
        <div className="section-title">{title}</div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Add Health Record</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : records.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <h3>No health records yet</h3>
          <p>{user.role === 'patient' ? 'You have no health records.' : 'Click "Add Health Record" to get started.'}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {records.map(r => (
            <div className="card card-orange" key={r.hId}>
              <div className="card-head">
                <div><div className="card-id">Record #{r.hId}</div><div className="card-name">{r.hType}</div></div>
                <span className="badge b-orange">{r.hType}</span>
              </div>
              <div className="card-fields">
                <div className="field"><span className="field-key">hType</span><span className="field-val">{r.hType}</span></div>
                <div className="field"><span className="field-key">hReadings</span><span className="field-val"><strong style={{color:'#0369a1'}}>{r.hReadings}</strong></span></div>
                {r.patient && <div className="field"><span className="field-key">Patient</span><span className="field-val">{r.patient.pName} (#{r.patient.pId})</span></div>}
              </div>
              <div className="card-footer">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.hId)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
