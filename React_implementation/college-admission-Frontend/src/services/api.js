import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({ baseURL: BASE_URL });

// Users
export const userAPI = {
  create: (data) => api.post('/users', data),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Applications
export const applicationAPI = {
  create: (data) => api.post('/applications', data),
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

// Courses
export const courseAPI = {
  create: (data) => api.post('/courses', data),
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Documents
export const documentAPI = {
  create: (data) => api.post('/documents', data),
  getAll: () => api.get('/documents'),
  getById: (id) => api.get(`/documents/${id}`),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
};

// Payments
export const paymentAPI = {
  create: (data) => api.post('/payments', data),
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export default api;
