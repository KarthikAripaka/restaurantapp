import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID;

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

// Menu
export const getMenu = (params) =>
  api.get(`/restaurants/${RESTAURANT_ID}/menu`, { params }).then((r) => r.data.data);

export const getCategories = () =>
  api.get(`/restaurants/${RESTAURANT_ID}/menu/categories`).then((r) => r.data.data);

// Orders
export const placeOrder = (payload) =>
  api.post(`/restaurants/${RESTAURANT_ID}/orders`, payload).then((r) => r.data.data);

export const trackOrder = ({ orderId, phone }) =>
  api.get(`/orders/track`, { params: { orderId, phone } }).then((r) => r.data.data);

export const getOrderHistory = (phone) =>
  api.get(`/orders/history`, { params: { phone } }).then((r) => r.data.data);

// Offers
export const getOffers = () =>
  api.get(`/restaurants/${RESTAURANT_ID}/offers`).then((r) => r.data.data);

// Settings
export const getSettings = () =>
  api.get(`/restaurants/${RESTAURANT_ID}/settings`).then((r) => r.data.data);

// Coupons
export const validateCoupon = (code, subtotal) =>
  api.post(`/restaurants/${RESTAURANT_ID}/coupons/validate`, { code, subtotal }).then((r) => r.data.data);

export default api;
