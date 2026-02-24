import React, { useState, useEffect } from 'react';
import { PatientAPI, DoctorAPI, ConsultationAPI, HealthRecordAPI, MedicalHistoryAPI } from '../services/api';

export default function Dashboard({ user }) {
  const [data, setData] = useState({ doctors:[], consultations:[], healthRecords:[], medicalHistories:[] });
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.role === 'patient') {
      // Patient: only load their own profile + doctors list
      Promise.allSettled([
        PatientAPI.getById(user.id),
        DoctorAPI.getAll(),
        ConsultationAPI.getAll(),
        HealthRecordAPI.getAll(),
        MedicalHistoryAPI.getAll(),
      ]).then(([p, d, c, h, m]) => {
        setMyProfile(p.status === 'fulfilled' ? p.value.data : null);
        setData({
          doctors:          d.status === 'fulfilled' ? d.value.data : [],
          consultations:    c.status === 'fulfilled' ? c.value.data : [],
          healthRecords:    h.status === 'fulfilled' ? h.value.data : [],
          medicalHistories: m.status === 'fulfilled' ? m.value.data : [],
        });
        setLoading(false);
      });
    } else {
      // Doctor: load all data
      Promise.allSettled([
        PatientAPI.getAll(),
        DoctorAPI.getById(user.id),
        ConsultationAPI.getAll(),
        HealthRecordAPI.getAll(),
        MedicalHistoryAPI.getAll(),
      ]).then(([p, d, c, h, m]) => {
        setMyProfile(d.status === 'fulfilled' ? d.value.data : null);
        setData({
          patients:         p.status === 'fulfilled' ? p.value.data : [],
          consultations:    c.status === 'fulfilled' ? c.value.data : [],
          healthRecords:    h.status === 'fulfilled' ? h.value.data : [],
          medicalHistories: m.status === 'fulfilled' ? m.value.data : [],
        });
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  // ── PATIENT DASHBOARD ─────────────────────────────────────
  if (user.role === 'patient') {
    const myConsultations   = data.consultations.filter(c   => c.patient?.pId === user.id);
    const myHealthRecords   = data.healthRecords.filter(h   => h.patient?.pId === user.id);
    const myMedicalHistory  = data.medicalHistories.filter(m => m.patient?.pId === user.id);

    return (
      <div>
        {/* Welcome */}
        <div className="welcome-banner">
          <div>
            <h2>Welcome, {user.name}! 👋</h2>
            <p>Here are your personal health details.</p>
          </div>
          <div className="welcome-icon">👤</div>
        </div>

        {/* My Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <div className="stat-box"><div className="stat-num" style={{ color:'#16a34a' }}>{myConsultations.length}</div><div className="stat-lbl">My Consultations</div></div>
          <div className="stat-box"><div className="stat-num" style={{ color:'#ea580c' }}>{myHealthRecords.length}</div><div className="stat-lbl">My Health Records</div></div>
          <div className="stat-box"><div className="stat-num" style={{ color:'#dc2626' }}>{myMedicalHistory.length}</div><div className="stat-lbl">My Medical History</div></div>
        </div>

        {/* My Profile Card */}
        {myProfile && (
          <div style={{ marginBottom: 20 }}>
            <div className="dash-panel-title" style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: '#1a202c' }}>
              <span className="dot" style={{ background: '#0369a1' }} /> My Profile
            </div>
            <div className="card card-blue" style={{ maxWidth: 400 }}>
              <div className="card-head">
                <div>
                  <div className="card-id">Patient #{myProfile.pId}</div>
                  <div className="card-name">{myProfile.pName}</div>
                </div>
                <span className={`badge ${myProfile.pGender === 'Male' ? 'b-blue' : myProfile.pGender === 'Female' ? 'b-purple' : 'b-gray'}`}>{myProfile.pGender}</span>
              </div>
              <div className="card-fields">
                <div className="field"><span className="field-key">Name</span><span className="field-val">{myProfile.pName}</span></div>
                <div className="field"><span className="field-key">Age</span><span className="field-val">{myProfile.pAge} years</span></div>
                <div className="field"><span className="field-key">Gender</span><span className="field-val">{myProfile.pGender}</span></div>
                <div className="field"><span className="field-key">Contact</span><span className="field-val">{myProfile.pContact}</span></div>
              </div>
            </div>
          </div>
        )}

        <div className="dash-grid">
          {/* My Consultations */}
          <div className="dash-panel">
            <div className="dash-panel-title"><span className="dot" style={{ background: '#16a34a' }} />My Consultations</div>
            {myConsultations.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No consultations yet.</p>}
            {myConsultations.slice(-4).reverse().map(c => (
              <div className="list-item" key={c.aId}>
                <div>
                  <div className="list-item-name">Consultation #{c.aId}</div>
                  <div className="list-item-sub">{c.doctor ? `Dr. ${c.doctor.dName}` : ''} · {c.feedback || 'No notes'}</div>
                </div>
                <span className="badge b-green">Active</span>
              </div>
            ))}
          </div>

          {/* My Health Records */}
          <div className="dash-panel">
            <div className="dash-panel-title"><span className="dot" style={{ background: '#ea580c' }} />My Health Records</div>
            {myHealthRecords.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No health records yet.</p>}
            {myHealthRecords.slice(-4).reverse().map(h => (
              <div className="list-item" key={h.hId}>
                <div>
                  <div className="list-item-name">{h.hType}</div>
                  <div className="list-item-sub">{h.hReadings}</div>
                </div>
                <span className="badge b-orange">#{h.hId}</span>
              </div>
            ))}
          </div>

          {/* Available Doctors */}
          <div className="dash-panel">
            <div className="dash-panel-title"><span className="dot" style={{ background: '#7c3aed' }} />Available Doctors</div>
            {data.doctors.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No doctors available.</p>}
            {data.doctors.slice(0, 4).map(d => (
              <div className="list-item" key={d.dId}>
                <div>
                  <div className="list-item-name">{d.dName}</div>
                  <div className="list-item-sub">{d.dSpeciality} · {d.dExperience} yrs exp</div>
                </div>
                <span className="badge b-purple">#{d.dId}</span>
              </div>
            ))}
          </div>

          {/* My Medical History */}
          <div className="dash-panel">
            <div className="dash-panel-title"><span className="dot" style={{ background: '#dc2626' }} />My Medical History</div>
            {myMedicalHistory.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No medical history yet.</p>}
            {myMedicalHistory.slice(-4).reverse().map(h => (
              <div className="list-item" key={h.mId}>
                <div>
                  <div className="list-item-name">History #{h.mId}</div>
                  <div className="list-item-sub">{h.doctor ? `Dr. ${h.doctor.dName}` : ''} {h.healthRecord ? `· ${h.healthRecord.hType}` : ''}</div>
                </div>
                <span className="badge b-red">Medical</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── DOCTOR DASHBOARD ──────────────────────────────────────
  const myConsultations  = data.consultations.filter(c => c.doctor?.dId === user.id);
  const myMedicalHistory = data.medicalHistories.filter(m => m.doctor?.dId === user.id);

  return (
    <div>
      <div className="welcome-banner">
        <div>
          <h2>Welcome, Dr. {user.name}! 👋</h2>
          <p>Here's your practice overview.</p>
        </div>
        <div className="welcome-icon">🩺</div>
      </div>

      {/* Doctor Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-box"><div className="stat-num" style={{ color:'#0369a1' }}>{(data.patients||[]).length}</div><div className="stat-lbl">Total Patients</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color:'#16a34a' }}>{myConsultations.length}</div><div className="stat-lbl">My Consultations</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color:'#ea580c' }}>{data.healthRecords.length}</div><div className="stat-lbl">Health Records</div></div>
        <div className="stat-box"><div className="stat-num" style={{ color:'#dc2626' }}>{myMedicalHistory.length}</div><div className="stat-lbl">My Med. Histories</div></div>
      </div>

      {/* Doctor Profile */}
      {myProfile && (
        <div style={{ marginBottom: 20 }}>
          <div className="dash-panel-title" style={{ marginBottom: 12, fontSize: 14, fontWeight: 700, color: '#1a202c' }}>
            <span className="dot" style={{ background: '#7c3aed' }} /> My Profile
          </div>
          <div className="card card-purple" style={{ maxWidth: 400 }}>
            <div className="card-head">
              <div>
                <div className="card-id">Doctor #{myProfile.dId}</div>
                <div className="card-name">{myProfile.dName}</div>
              </div>
              <span className="badge b-purple">{myProfile.dSpeciality}</span>
            </div>
            <div className="card-fields">
              <div className="field"><span className="field-key">Name</span><span className="field-val">{myProfile.dName}</span></div>
              <div className="field"><span className="field-key">Speciality</span><span className="field-val">{myProfile.dSpeciality}</span></div>
              <div className="field"><span className="field-key">Experience</span><span className="field-val">{myProfile.dExperience} years</span></div>
              <div className="field"><span className="field-key">Contact</span><span className="field-val">{myProfile.dContact}</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="dash-grid">
        {/* Recent Patients */}
        <div className="dash-panel">
          <div className="dash-panel-title"><span className="dot" style={{ background: '#0369a1' }} />Recent Patients</div>
          {(data.patients||[]).length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No patients yet.</p>}
          {(data.patients||[]).slice(-4).reverse().map(p => (
            <div className="list-item" key={p.pId}>
              <div><div className="list-item-name">{p.pName}</div><div className="list-item-sub">{p.pGender} · Age {p.pAge}</div></div>
              <span className="badge b-blue">#{p.pId}</span>
            </div>
          ))}
        </div>

        {/* My Consultations */}
        <div className="dash-panel">
          <div className="dash-panel-title"><span className="dot" style={{ background: '#16a34a' }} />My Consultations</div>
          {myConsultations.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No consultations yet.</p>}
          {myConsultations.slice(-4).reverse().map(c => (
            <div className="list-item" key={c.aId}>
              <div>
                <div className="list-item-name">Consultation #{c.aId}</div>
                <div className="list-item-sub">{c.patient ? c.patient.pName : ''} · {c.feedback || 'No notes'}</div>
              </div>
              <span className="badge b-green">Active</span>
            </div>
          ))}
        </div>

        {/* Recent Health Records */}
        <div className="dash-panel">
          <div className="dash-panel-title"><span className="dot" style={{ background: '#ea580c' }} />Recent Health Records</div>
          {data.healthRecords.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No records yet.</p>}
          {data.healthRecords.slice(-4).reverse().map(h => (
            <div className="list-item" key={h.hId}>
              <div><div className="list-item-name">{h.hType}</div><div className="list-item-sub">{h.hReadings}</div></div>
              <span className="badge b-orange">#{h.hId}</span>
            </div>
          ))}
        </div>

        {/* My Medical History */}
        <div className="dash-panel">
          <div className="dash-panel-title"><span className="dot" style={{ background: '#dc2626' }} />My Medical Histories</div>
          {myMedicalHistory.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No medical histories yet.</p>}
          {myMedicalHistory.slice(-4).reverse().map(h => (
            <div className="list-item" key={h.mId}>
              <div>
                <div className="list-item-name">History #{h.mId}</div>
                <div className="list-item-sub">{h.patient ? h.patient.pName : ''} {h.healthRecord ? `· ${h.healthRecord.hType}` : ''}</div>
              </div>
              <span className="badge b-red">Medical</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
