import React, { useState } from 'react';
import './App.css';
import AuthPage    from './pages/AuthPage';
import Sidebar     from './components/Sidebar';
import Dashboard   from './pages/Dashboard';
import Patients    from './pages/Patients';
import Doctors     from './pages/Doctors';
import Consultations  from './pages/Consultations';
import HealthRecords  from './pages/HealthRecords';
import MedicalHistory from './pages/MedicalHistory';

const PAGES = {
  dashboard:     { title:'Dashboard',       subtitle:'Overview of Patient Monitoring System' },
  patients:      { title:'Patients',        subtitle:'Manage patients — pId, pName, pAge, pGender, pContact' },
  doctors:       { title:'Doctors',         subtitle:'Manage doctors — dId, dName, dSpeciality, dExperience, dContact' },
  consultations: { title:'Consultations',   subtitle:'Manage consultations — aId, feedback, patient, doctor' },
  healthrecords: { title:'Health Records',  subtitle:'Manage health records — hId, hType, hReadings, patient' },
  medicalhistory:{ title:'Medical History', subtitle:'Manage medical histories — mId, patient, doctor, healthRecord' },
};

const PAGE_COMPONENTS = { dashboard:Dashboard, patients:Patients, doctors:Doctors, consultations:Consultations, healthrecords:HealthRecords, medicalhistory:MedicalHistory };

export default function App() {
  const [user, setUser]     = useState(null);
  const [active, setActive] = useState('dashboard');

  if (!user) return <AuthPage onLogin={setUser} />;

  const page = PAGES[active];
  const PageComponent = PAGE_COMPONENTS[active];

  return (
    <div className="layout">
      <Sidebar active={active} onNav={setActive} user={user} onLogout={() => setUser(null)} />
      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">{page.title}</div>
            <div className="topbar-sub">{page.subtitle}</div>
          </div>
        </div>
        <div className="page-body">
          <PageComponent user={user} />
        </div>
      </div>
    </div>
  );
}
