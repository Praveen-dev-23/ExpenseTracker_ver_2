import axios from 'axios';

const API_BASE = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Transaction API
export const transactionAPI = {
  getAll: (filters) => api.get('/transactions', { params: filters }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

// Reports API
export const reportsAPI = {
  exportCSV: (filters) => api.get('/reports/export-csv', { 
    params: filters, 
    responseType: 'blob' 
  }),
  exportPDF: (filters) => api.get('/reports/export-pdf', { 
    params: filters, 
    responseType: 'blob' 
  }),
};

export default api;