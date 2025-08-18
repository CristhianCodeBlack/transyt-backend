import api from './api';

export const usuarioService = {
  // Listar usuarios de la empresa
  listarUsuarios: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  // Obtener usuario por ID
  obtenerUsuario: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Crear usuario
  crearUsuario: async (userData) => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },

  // Actualizar usuario
  actualizarUsuario: async (id, userData) => {
    const response = await api.put(`/usuarios/${id}`, userData);
    return response.data;
  },

  // Eliminar usuario
  eliminarUsuario: async (id) => {
    await api.delete(`/usuarios/${id}`);
  },

  // Asignar curso a usuario
  asignarCurso: async (usuarioId, cursoId) => {
    const response = await api.post(`/usuarios/${usuarioId}/cursos/${cursoId}`);
    return response.data;
  },

  // Desasignar curso de usuario
  desasignarCurso: async (usuarioId, cursoId) => {
    await api.delete(`/usuarios/${usuarioId}/cursos/${cursoId}`);
  }
};