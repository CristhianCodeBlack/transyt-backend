import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traducciones
const resources = {
  es: {
    translation: {
      // Navegación
      "nav.dashboard": "Dashboard",
      "nav.courses": "Cursos",
      "nav.users": "Usuarios",
      "nav.certificates": "Certificados",
      "nav.reports": "Reportes",
      "nav.settings": "Configuración",
      "nav.logout": "Cerrar Sesión",
      
      // Botones comunes
      "btn.save": "Guardar",
      "btn.cancel": "Cancelar",
      "btn.edit": "Editar",
      "btn.delete": "Eliminar",
      "btn.create": "Crear",
      "btn.continue": "Continuar",
      
      // Mensajes
      "msg.loading": "Cargando...",
      "msg.error": "Error",
      "msg.success": "Éxito",
      "msg.noData": "No hay datos disponibles",
      
      // Cursos
      "course.progress": "Progreso",
      "course.completed": "Completado",
      "course.inProgress": "En Progreso",
      "course.notStarted": "No Iniciado"
    }
  },
  en: {
    translation: {
      // Navigation
      "nav.dashboard": "Dashboard",
      "nav.courses": "Courses",
      "nav.users": "Users", 
      "nav.certificates": "Certificates",
      "nav.reports": "Reports",
      "nav.settings": "Settings",
      "nav.logout": "Logout",
      
      // Common buttons
      "btn.save": "Save",
      "btn.cancel": "Cancel",
      "btn.edit": "Edit",
      "btn.delete": "Delete",
      "btn.create": "Create",
      "btn.continue": "Continue",
      
      // Messages
      "msg.loading": "Loading...",
      "msg.error": "Error",
      "msg.success": "Success",
      "msg.noData": "No data available",
      
      // Courses
      "course.progress": "Progress",
      "course.completed": "Completed",
      "course.inProgress": "In Progress",
      "course.notStarted": "Not Started"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // idioma por defecto
    fallbackLng: 'es',
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;