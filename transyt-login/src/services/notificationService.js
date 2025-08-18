import toast from 'react-hot-toast';

// Simulación de socket.io hasta que se instale
const io = (url, options) => {
  return {
    on: () => {},
    emit: () => {},
    disconnect: () => {},
    connected: false
  };
};

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.notifications = [];
    this.listeners = [];
  }

  connect() {
    if (this.socket) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('🔗 Servicio de notificaciones iniciado (modo simulación)');
    this.isConnected = true;
    
    // Simular conexión exitosa
    setTimeout(() => {
      toast.success('Conectado a notificaciones TRANSYT (simulación)', {
        duration: 2000,
        icon: '🔔'
      });
      
      // Agregar notificaciones de prueba
      this.addDemoNotifications();
    }, 1000);

    // Comentado temporalmente hasta instalar socket.io-client
    // this.socket = io('http://localhost:8080', {
    //   auth: { token },
    //   transports: ['websocket', 'polling']
    // });
    
    // this.socket.on('connect', () => {
    //   this.isConnected = true;
    //   console.log('🔗 Conectado a notificaciones TRANSYT');
    //   toast.success('Conectado a notificaciones en tiempo real', {
    //     duration: 2000,
    //     icon: '🔔'
    //   });
    // });

    // this.socket.on('disconnect', () => {
    //   this.isConnected = false;
    //   console.log('❌ Desconectado de notificaciones');
    // });

    // this.socket.on('notification', (notification) => {
    //   this.handleNotification(notification);
    // });

    // this.socket.on('course_progress', (data) => {
    //   this.handleCourseProgress(data);
    // });

    // this.socket.on('certificate_generated', (data) => {
    //   this.handleCertificateGenerated(data);
    // });

    // this.socket.on('new_course_assigned', (data) => {
    //   this.handleNewCourseAssigned(data);
    // });
  }

  disconnect() {
    console.log('🔌 Desconectando servicio de notificaciones');
    this.isConnected = false;
    // if (this.socket) {
    //   this.socket.disconnect();
    //   this.socket = null;
    // }
  }

  handleNotification(notification) {
    this.notifications.unshift(notification);
    
    // Mostrar toast según el tipo
    const toastConfig = this.getToastConfig(notification.type);
    toast(notification.message, toastConfig);

    // Notificar a los listeners
    this.listeners.forEach(listener => listener(notification));
  }

  handleCourseProgress(data) {
    const { userName, courseName, progress } = data;
    
    if (progress >= 100) {
      toast.success(`🎉 ${userName} completó el curso "${courseName}"`, {
        duration: 5000,
        icon: '🏆'
      });
    } else {
      toast(`📈 ${userName} progresó ${progress}% en "${courseName}"`, {
        duration: 3000,
        icon: '📚'
      });
    }
  }

  handleCertificateGenerated(data) {
    const { userName, courseName } = data;
    toast.success(`🎓 Certificado generado para ${userName} - ${courseName}`, {
      duration: 6000,
      icon: '📜'
    });
  }

  handleNewCourseAssigned(data) {
    const { courseName, assignedBy } = data;
    toast(`📚 Nuevo curso asignado: "${courseName}" por ${assignedBy}`, {
      duration: 4000,
      icon: '🆕',
      style: {
        background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
        color: 'white'
      }
    });
  }

  getToastConfig(type) {
    const configs = {
      'success': { icon: '✅', duration: 3000 },
      'info': { icon: 'ℹ️', duration: 4000 },
      'warning': { icon: '⚠️', duration: 5000 },
      'error': { icon: '❌', duration: 6000 },
      'course_completed': { icon: '🎉', duration: 5000 },
      'certificate_ready': { icon: '🏆', duration: 6000 }
    };
    
    return configs[type] || { icon: '🔔', duration: 3000 };
  }

  // Enviar notificación
  sendNotification(type, data) {
    console.log('📤 Enviando notificación (simulación):', type, data);
    // if (this.socket && this.isConnected) {
    //   this.socket.emit('send_notification', { type, data });
    // }
  }

  // Suscribirse a notificaciones
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Obtener notificaciones
  getNotifications() {
    return this.notifications;
  }

  // Marcar notificación como leída
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      console.log('✅ Notificación marcada como leída (simulación):', notificationId);
      // if (this.socket) {
      //   this.socket.emit('mark_read', notificationId);
      // }
    }
  }

  // Limpiar notificaciones
  clearNotifications() {
    this.notifications = [];
  }
  
  // Agregar notificaciones de prueba
  addDemoNotifications() {
    const demoNotifications = [
      {
        id: Date.now() + 1,
        type: 'course_completed',
        title: 'Curso Completado',
        message: 'Has completado exitosamente el curso de Seguridad Industrial',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: Date.now() + 2,
        type: 'certificate_ready',
        title: 'Certificado Disponible',
        message: 'Tu certificado de Primeros Auxilios está listo para descargar',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      },
      {
        id: Date.now() + 3,
        type: 'course_assigned',
        title: 'Nuevo Curso Asignado',
        message: 'Se te ha asignado el curso "Prevención de Riesgos Laborales"',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: true
      }
    ];
    
    this.notifications = [...demoNotifications, ...this.notifications];
    
    // Notificar a los listeners
    this.listeners.forEach(listener => {
      demoNotifications.forEach(notification => {
        if (!notification.read) {
          listener(notification);
        }
      });
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;