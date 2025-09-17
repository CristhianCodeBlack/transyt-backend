// Keep-alive service para mantener el backend despierto
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://transyt-backend.onrender.com/api';

class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning || import.meta.env.MODE !== 'production') {
      return;
    }

    console.log('🔄 Iniciando keep-alive service...');
    this.isRunning = true;

    // Ping cada 14 minutos (Render duerme después de 15 minutos de inactividad)
    this.intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/health/quick`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('💚 Keep-alive ping exitoso');
        } else {
          console.log('⚠️ Keep-alive ping falló:', response.status);
        }
      } catch (error) {
        console.log('❌ Keep-alive error:', error.message);
      }
    }, 14 * 60 * 1000); // 14 minutos
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 Keep-alive service detenido');
    }
  }
}

export const keepAliveService = new KeepAliveService();

// Auto-iniciar en producción cuando el usuario está activo
if (import.meta.env.MODE === 'production') {
  // Iniciar después del primer login exitoso
  window.addEventListener('storage', (e) => {
    if (e.key === 'token' && e.newValue) {
      keepAliveService.start();
    } else if (e.key === 'token' && !e.newValue) {
      keepAliveService.stop();
    }
  });

  // Si ya hay token, iniciar inmediatamente
  if (localStorage.getItem('token')) {
    keepAliveService.start();
  }
}