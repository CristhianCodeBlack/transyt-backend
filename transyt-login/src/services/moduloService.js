import api from './api';

export const moduloService = {
  // Obtener módulos por curso
  listarModulosPorCurso: async (cursoId) => {
    const response = await api.get(`/modulos/dto/curso/${cursoId}`);
    return response.data;
  },

  // Obtener módulo por ID
  obtenerModulo: async (id) => {
    const response = await api.get(`/modulos/${id}`);
    return response.data;
  },

  // Crear módulo de texto
  crearModuloTexto: async (moduloData) => {
    const response = await api.post('/modulos', moduloData);
    return response.data;
  },

  // Crear módulo con archivo
  crearModuloConArchivo: async (formData) => {
    const response = await api.post('/modulos/con-archivo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Actualizar módulo
  actualizarModulo: async (id, moduloData) => {
    const response = await api.put(`/modulos/${id}`, moduloData);
    return response.data;
  },

  // Eliminar módulo
  eliminarModulo: async (id) => {
    await api.delete(`/modulos/${id}`);
  },

  // Descargar archivo del módulo
  descargarArchivo: async (id) => {
    const response = await api.get(`/modulos/${id}/archivo`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Vista previa del archivo
  previsualizarArchivo: async (id) => {
    const response = await api.get(`/modulos/${id}/preview`, {
      responseType: 'blob',
    });
    return response.data;
  }
};