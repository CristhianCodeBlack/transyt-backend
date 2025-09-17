import axios from 'axios';

// Configuración de API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://transyt-backend.onrender.com/api' : 'http://localhost:8080/api');

// Debug: mostrar qué URL se está usando
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

// Crear instancia de axios con timeouts optimizados para Render
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 segundos para cold starts de Render
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para despertar el backend si está dormido
const wakeUpBackend = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`😴 Despertando backend... (intento ${i + 1}/${maxRetries})`);
      await axios.get(`${API_BASE_URL.replace('/api', '')}/actuator/health`, { 
        timeout: 15000 // 15 segundos por intento
      });
      console.log('✅ Backend despierto');
      return true;
    } catch (error) {
      console.log(`⚠️ Backend aún iniciando... (intento ${i + 1}/${maxRetries})`);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos entre intentos
      }
    }
  }
  return false;
};

// Despertar backend al cargar la app en producción
if (import.meta.env.MODE === 'production') {
  // Despertar backend de forma asíncrona sin bloquear la carga
  setTimeout(() => {
    wakeUpBackend().then(isAwake => {
      if (isAwake) {
        console.log('🚀 Backend pre-calentado exitosamente');
      } else {
        console.log('⚠️ Backend puede tardar en responder en el primer uso');
      }
    });
  }, 1000);
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
    const maxRetries = 2;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔐 Intentando login... (intento ${attempt + 1}/${maxRetries + 1})`);
        
        const response = await api.post('/auth/login', { correo, clave }, { 
          timeout: 60000 // 60 segundos por intento
        });
        
        console.log('✅ Login exitoso');
        return response.data;
        
      } catch (error) {
        console.log(`❌ Error en login (intento ${attempt + 1}):`, error.message);
        
        // Si es el último intento, lanzar error
        if (attempt === maxRetries) {
          if (error.response?.status === 401) {
            throw new Error('Credenciales incorrectas');
          }
          throw new Error('Servidor no disponible. El servicio puede estar iniciando, intenta de nuevo en 2-3 minutos.');
        }
        
        // Si es timeout o error de servidor, intentar despertar backend
        if (error.code === 'ECONNABORTED' || error.response?.status >= 500 || !error.response) {
          console.log('🔄 Backend dormido, despertando...');
          
          const isAwake = await wakeUpBackend();
          if (isAwake) {
            console.log('⏳ Esperando que el backend termine de inicializar...');
            await new Promise(resolve => setTimeout(resolve, 8000)); // Esperar 8 segundos
          } else {
            console.log('⚠️ No se pudo despertar el backend');
            await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 10 segundos antes del siguiente intento
          }
        } else {
          // Para otros errores, esperar menos tiempo
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
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