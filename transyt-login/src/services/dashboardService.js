import api from './api';

export const dashboardService = {
  // Estadísticas para admin
  getAdminStats: async () => {
    try {
      const response = await api.get('/dashboard/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error loading admin stats:', error);
      return {
        totalUsuarios: 0,
        totalCursos: 0,
        certificadosEmitidos: 0,
        progresoPromedio: 0
      };
    }
  },

  // Actividad reciente
  getRecentActivity: async () => {
    try {
      const response = await api.get('/dashboard/admin/recent-activity');
      return response.data;
    } catch (error) {
      console.error('Error loading recent activity:', error);
      return [];
    }
  }
};

// Servicio para reportes
export const reportesService = {
  getReporteUsuarios: async () => {
    const response = await api.get('/reportes/usuarios');
    return response.data;
  },

  getReporteCursos: async () => {
    const response = await api.get('/reportes/cursos');
    return response.data;
  },

  getReporteCertificados: async () => {
    const response = await api.get('/reportes/certificados');
    return response.data;
  },

  exportarReporte: async (tipo, formato = 'pdf') => {
    const response = await api.get(`/reportes/exportar/${tipo}?formato=${formato}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// MOVED: certificadosAdminService movido a certificadoService.js

// MOVED: usuariosAdminService movido a usuarioService.js
// TODO: Mover este servicio al archivo correspondiente
export const usuariosAdminService = {
  getUsuarios: async () => {
    const response = await api.get('/admin/usuarios');
    return response.data;
  },

  createUsuario: async (userData) => {
    const response = await api.post('/admin/usuarios', userData);
    return response.data;
  },

  updateUsuario: async (id, userData) => {
    const response = await api.put(`/admin/usuarios/${id}`, userData);
    return response.data;
  },

  deleteUsuario: async (id) => {
    const response = await api.delete(`/admin/usuarios/${id}`);
    return response.data;
  },

  asignarCurso: async (usuarioId, cursoId) => {
    const response = await api.post(`/cursos/${cursoId}/usuarios/${usuarioId}`, {});
    return response.data;
  },

  desasignarCurso: async (usuarioId, cursoId) => {
    const response = await api.delete(`/admin/usuarios/${usuarioId}/cursos/${cursoId}`);
    return response.data;
  },

  getCursosUsuario: async (usuarioId) => {
    const response = await api.get(`/admin/usuarios/${usuarioId}/cursos`);
    return response.data;
  },

  asignarInstructor: async (cursoId, instructorId) => {
    const response = await api.post(`/cursos/${cursoId}/instructor/${instructorId}`);
    return response.data;
  },

  desasignarInstructor: async (cursoId) => {
    const response = await api.delete(`/cursos/${cursoId}/instructor`);
    return response.data;
  },

  saveModulos: async (cursoId, modulos) => {
    const response = await api.post(`/cursos/${cursoId}/modulos`, modulos);
    return response.data;
  },

  getModulos: async (cursoId) => {
    const response = await api.get(`/modulos/curso/${cursoId}`);
    return response.data;
  }
};