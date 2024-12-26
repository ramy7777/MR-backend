import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUserDashboard = async () => {
  const response = await api.get('/api/users/dashboard');
  return response.data;
};

export const getUserDevices = async () => {
  const response = await api.get('/api/users/devices');
  return response.data;
};

export const getUserSubscription = async () => {
  const response = await api.get('/api/users/subscription');
  return response.data;
};

export const getUserSessions = async () => {
  const response = await api.get('/api/users/sessions');
  return response.data;
};

export default api;
