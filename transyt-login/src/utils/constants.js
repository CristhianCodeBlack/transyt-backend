// Constantes de la aplicación
export const APP_NAME = 'TRANSYT';
export const VERSION = '1.0.3-' + Date.now(); // Forzar nuevo build

// URLs base según el entorno
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback para desarrollo
  return import.meta.env.MODE === 'production' 
    ? 'https://transyt-backend.onrender.com/api'
    : 'http://localhost:8080/api';
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  CURSOS: '/cursos',
  USUARIOS: '/usuarios',
  EVALUACIONES: '/evaluaciones',
  MODULOS: '/modulos',
  FILES: '/files'
};