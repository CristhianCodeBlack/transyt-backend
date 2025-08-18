import api from './api';

export const cursoService = {
  // Obtener todos los cursos
  listarCursos: async () => {
    const response = await api.get('/cursos/dto');
    return response.data;
  },

  // Alias para compatibilidad
  listarCursosDTO: async () => {
    const response = await api.get('/cursos/dto');
    return response.data;
  },

  // Obtener curso por ID
  obtenerCurso: async (id) => {
    const response = await api.get(`/cursos/${id}`);
    return response.data;
  },

  // Crear nuevo curso
  crearCurso: async (cursoData) => {
    const response = await api.post('/cursos', cursoData);
    return response.data;
  },

  // Actualizar curso
  actualizarCurso: async (id, cursoData) => {
    const response = await api.put(`/cursos/${id}`, cursoData);
    return response.data;
  },

  // Eliminar curso
  eliminarCurso: async (id) => {
    await api.delete(`/cursos/${id}`);
  }
};