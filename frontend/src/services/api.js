import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

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

// Response interceptor to handle auth errors
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

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Document API
export const documentAPI = {
  getDocuments: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },
  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  downloadDocument: async (id) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  },
  chatWithDocument: async (id, question, language = 'en') => {
    const response = await api.post(`/documents/${id}/chat`, {
      question,
      language,
    });
    return response.data;
  },
  globalSearch: async (query, language = 'en') => {
    const response = await api.post('/documents/search', {
      query,
      language,
    });
    return response.data;
  },
  
  globalChat: async (query, language = 'en') => {
    const response = await api.post('/documents/search', {
      query,
      language,
    });
    return response.data;
  },

  // AI Service endpoints
  translate: async (text, targetLanguage) => {
    const response = await api.post('/ai-service/translate', {
      text,
      target_language: targetLanguage
    });
    return response.data;
  },
};

export default api;
