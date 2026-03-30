import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

/* ---- Auth ---- */
export const authAPI = {
  login:    (dto)    => api.post('/auth/login', dto),
};

/* ---- Users ---- */
export const userAPI = {
  getAll:   ()       => api.get('/users'),
  getById:  (id)     => api.get(`/users/${id}`),
  create:   (data)   => api.post('/users', data),
  delete:   (id)     => api.delete(`/users/${id}`),
};

/* ---- Locations ---- */
export const locationAPI = {
  getAll:   ()       => api.get('/locations'),
  create:   (data)   => api.post('/locations', data),
};

/* ---- Parking Spots ---- */
export const spotAPI = {
  getAll:        ()       => api.get('/spots'),
  create:        (data)   => api.post('/spots', data),
  searchByCity:  (city)   => api.get(`/spots/search?city=${city}`),
  approve:       (id)     => api.post(`/spots/approve/${id}`),
};

/* ---- Parking Slots ---- */
export const slotAPI = {
  getAll:   ()       => api.get('/slots'),
  create:   (data)   => api.post('/slots', data),
};

/* ---- Bookings ---- */
export const bookingAPI = {
  getAll:     ()     => api.get('/bookings'),
  create:     (data) => api.post('/bookings/create', data),
  payAdvance: (id)   => api.post(`/bookings/pay-advance/${id}`),
  cancel:     (id)   => api.delete(`/bookings/${id}`),
  checkout:   (id)   => api.post(`/bookings/checkout/${id}`),
};

/* ---- Vehicles ---- */
export const vehicleAPI = {
  getAll:   ()       => api.get('/vehicles'),
  create:   (data)   => api.post('/vehicles', data),
};

/* ---- Wallet ---- */
export const walletAPI = {
  getAll:   ()       => api.get('/wallets'),
  create:   (data)   => api.post('/wallets', data),
};

/* ---- Wallet Transactions ---- */
export const transactionAPI = {
  getAll:   ()       => api.get('/transactions'),
  create:   (data)   => api.post('/transactions', data),
};

export default api;

/* ---- Pricing ---- */
export const pricingAPI = {
  getRules:    ()           => api.get('/pricing/rules'),
  saveRule:    (data)       => api.post('/pricing/rules', data),
  deleteRule:  (id)         => api.delete(`/pricing/rules/${id}`),
  calculate:   (params)     => api.get('/pricing/calculate', { params }),
};
