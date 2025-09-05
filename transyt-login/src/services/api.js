import axios from 'axios';

// Configuración de API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://transyt-backend.onrender.com/api' : 'http://localhost:8080/api');

// Debug: mostrar qué URL se está usando
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

// Crear instancia de axios con timeouts optimizados
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos máximo
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para despertar el backend si está dormido
const wakeUpBackend = async () => {
  try {
    console.log('😴 Despertando backend...');
    await axios.get(`${API_BASE_URL.replace('/api', '')}/actuator/health`, { timeout: 5000 });
    console.log('✅ Backend despierto');
  } catch (error) {
    console.log('⚠️ Backend aún iniciando...');
  }
};

// Despertar backend al cargar la app
if (import.meta.env.MODE === 'production') {
  wakeUpBackend();
}

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
    try {
      const response = await api.post('/auth/login', { correo, clave });
      return response.data;
    } catch (error) {
      // Si falla, intentar despertar backend y reintentar
      if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        console.log('🔄 Reintentando login...');
        await wakeUpBackend();
        await new Promise(resolve => setTimeout(resolve, 2000));
        const retryResponse = await api.post('/auth/login', { correo, clave });
        return retryResponse.data;
      }
      throw error;
    }
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