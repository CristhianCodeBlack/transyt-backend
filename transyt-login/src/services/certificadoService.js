import api from './api';

export const certificadoService = {
  getMisCertificados: async () => {
    const response = await api.get('/certificados/mis-certificados');
    return response.data;
  },

  descargarCertificado: async (certificadoId, codigoVerificacion) => {
    const response = await api.get(`/certificados/descargar/${certificadoId}`, {
      responseType: 'blob'
    });
    
    // Crear URL para descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificado_${codigoVerificacion}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};

export const certificadosAdminService = {
  getCertificados: async () => {
    try {
      console.log('Solicitando certificados admin...');
      const response = await api.get('/certificados/admin/todos');
      console.log('Respuesta certificados:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo certificados:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  revocarCertificado: async (certificadoId) => {
    try {
      const response = await api.put(`/certificados/admin/${certificadoId}/revocar`);
      return response.data;
    } catch (error) {
      console.error('Error revocando certificado:', error.response?.status, error.response?.data);
      throw error;
    }
  },
  
  debugAuth: async () => {
    try {
      const response = await api.get('/certificados/debug/auth');
      return response.data;
    } catch (error) {
      console.error('Error en debug auth:', error);
      throw error;
    }
  }
};