import api from './axios';

// Users
export const userApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Books (Stock)
export const bookApi = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  getByUser: (userId) => api.get(`/books/user/${userId}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

// Issues
export const issueApi = {
  getAll: () => api.get('/issues'),
  getById: (id) => api.get(`/issues/${id}`),
  getByUser: (userId) => api.get(`/issues/user/${userId}`),
  getByBook: (bookId) => api.get(`/issues/book/${bookId}`),
  getByStatus: (status) => api.get(`/issues/status/${status}`),
  create: (data) => api.post('/issues', data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  delete: (id) => api.delete(`/issues/${id}`),
};

// Notifications
export const notifyApi = {
  getAll: () => api.get('/notifications'),
  getById: (id) => api.get(`/notifications/${id}`),
  getByUser: (userId) => api.get(`/notifications/user/${userId}`),
  getByIssue: (issueId) => api.get(`/notifications/issue/${issueId}`),
  create: (data) => api.post('/notifications', data),
  update: (id, data) => api.put(`/notifications/${id}`, data),
  delete: (id) => api.delete(`/notifications/${id}`),
};
