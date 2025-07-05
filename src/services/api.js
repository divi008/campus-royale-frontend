import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getProfile: () => api.get('/profile'),
};

// Questions API calls
export const questionsAPI = {
  getAll: () => api.get('/questions'),
  create: (questionData) => api.post('/questions', questionData),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

// Suggestions API calls
export const suggestionsAPI = {
  submit: (suggestionData) => api.post('/suggestions', suggestionData),
  getAll: (status) => api.get(`/suggestions${status ? `?status=${status}` : ''}`),
  approve: (id, data) => api.put(`/suggestions/${id}/approve`, data),
  reject: (id) => api.put(`/suggestions/${id}/reject`),
};

// Bets API calls
export const betsAPI = {
  placeBet: (betData) => api.post('/place-bet', betData),
};

// Leaderboard API calls
export const leaderboardAPI = {
  getLeaderboard: () => api.get('/leaderboard'),
};

export default api; 