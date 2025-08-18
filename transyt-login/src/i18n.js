import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  es: {
    translation: {
      "app.title": "Transyt Capacitación",
      "nav.admin.panel": "Panel Admin",
      "nav.admin.users": "Usuarios",
      "nav.admin.courses": "Cursos",
      "nav.admin.modules": "Módulos",
      "nav.instructor.panel": "Panel Instructor",
      "nav.instructor.courses": "Cursos",
      "nav.instructor.modules": "Módulos",
      "nav.instructor.progress": "Progreso Empleados",
      "nav.employee.courses": "Mis Cursos",
      "nav.employee.progress": "Progreso",
      "button.logout": "Salir",
      "button.register": "Registrarse",
      "form.name": "Nombre",
      "form.email": "Correo",
      "form.password": "Contraseña",
      "form.role": "Rol"
    }
  },
  en: {
    translation: {
      "app.title": "Transyt Training",
      "nav.admin.panel": "Admin Panel",
      "nav.admin.users": "Users",
      "nav.admin.courses": "Courses",
      "nav.admin.modules": "Modules",
      "nav.instructor.panel": "Instructor Panel",
      "nav.instructor.courses": "Courses",
      "nav.instructor.modules": "Modules",
      "nav.instructor.progress": "Employee Progress",
      "nav.employee.courses": "My Courses",
      "nav.employee.progress": "Progress",
      "button.logout": "Logout",
      "button.register": "Register",
      "form.name": "Name",
      "form.email": "Email",
      "form.password": "Password",
      "form.role": "Role"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    debug: false,
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;