import api from './api';

export const configuracionService = {
  // Obtener configuración completa
  getConfiguracion: async () => {
    const response = await api.get('/admin/configuracion');
    return response.data;
  },

  // Actualizar configuración por sección
  updateConfiguracion: async (seccion, datos) => {
    const response = await api.put(`/admin/configuracion/${seccion}`, datos);
    return response.data;
  },

  // Obtener configuración de empresa
  getEmpresa: async () => {
    const response = await api.get('/admin/configuracion/empresa');
    return response.data;
  },

  // Obtener configuración del sistema
  getSistema: async () => {
    const response = await api.get('/admin/configuracion/sistema');
    return response.data;
  },

  // Obtener configuración de certificados
  getCertificados: async () => {
    const response = await api.get('/admin/configuracion/certificados');
    return response.data;
  }
};