import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export const loginUser = (data) => API.post('/users/login', data);
export const registerUser = (data) => API.post('/users', data);
export const getAllProducts = () => API.get('/products');
export const getAllCarts = () => API.get('/carts');
export const addCart = (data) => API.post('/carts', data);
export const deleteCart = (id) => API.delete(`/carts/${id}`);
export const getAllOrders = () => API.get('/orders');
export const addOrder = (data) => API.post('/orders', data);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);
export const updateOrder = (id, data) => API.put(`/orders/${id}`, data);
export const getAllPayments = () => API.get('/payments');
export const addPayment = (data) => API.post('/payments', data);
export const getAllDeliveries = () => API.get('/deliveries');
export const getAllDiscounts = () => API.get('/discounts');

export default API;
