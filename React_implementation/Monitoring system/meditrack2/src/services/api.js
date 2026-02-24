import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

const safe = (data) => (Array.isArray(data) ? data : []);

export const PatientAPI = {
  getAll:  ()     => API.get('/patients').then(r => ({ ...r, data: safe(r.data) })),
  getById: (id)   => API.get(`/patients/${id}`),
  create:  (data) => API.post('/patients', data),
  delete:  (id)   => API.delete(`/patients/${id}`),
};

export const DoctorAPI = {
  getAll:  ()     => API.get('/doctors').then(r => ({ ...r, data: safe(r.data) })),
  getById: (id)   => API.get(`/doctors/${id}`),
  create:  (data) => API.post('/doctors', data),
  delete:  (id)   => API.delete(`/doctors/${id}`),
};

export const ConsultationAPI = {
  getAll:  ()     => API.get('/consultations').then(r => ({ ...r, data: safe(r.data) })),
  create:  (data) => API.post('/consultations', data),
  delete:  (id)   => API.delete(`/consultations/${id}`),
};

export const HealthRecordAPI = {
  getAll:  ()     => API.get('/healthrecords').then(r => ({ ...r, data: safe(r.data) })),
  create:  (data) => API.post('/healthrecords', data),
  delete:  (id)   => API.delete(`/healthrecords/${id}`),
};

export const MedicalHistoryAPI = {
  getAll:  ()     => API.get('/medicalhistory').then(r => ({ ...r, data: safe(r.data) })),
  create:  (data) => API.post('/medicalhistory', data),
  delete:  (id)   => API.delete(`/medicalhistory/${id}`),
};
