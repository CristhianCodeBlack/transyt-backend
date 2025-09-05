import axios from 'axios';

// Configuración de API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://transyt-backend.onrender.com/api' : 'http://localhost:8080/api');

// Debug: mostrar qué URL se está usando
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
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

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('nombre');
      localStorage.removeItem('rol');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (correo, clave) => {
    const response = await api.post('/auth/login', { correo, clave });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
  }
};

export default api;