import api from './api';

export const evaluacionService = {
  // Listar evaluaciones por curso
  listarPorCurso: async (cursoId) => {
    const response = await api.get(`/evaluaciones/curso/${cursoId}`);
    return response.data;
  },

  // Obtener evaluación por ID
  obtenerEvaluacion: async (id) => {
    const response = await api.get(`/evaluaciones/${id}`);
    return response.data;
  },

  // Crear evaluación
  crearEvaluacion: async (evaluacionData) => {
    const response = await api.post('/evaluaciones', evaluacionData);
    return response.data;
  },

  // Agregar pregunta a evaluación
  agregarPregunta: async (evaluacionId, preguntaData) => {
    const response = await api.post(`/evaluaciones/${evaluacionId}/preguntas`, preguntaData);
    return response.data;
  },

  // Responder evaluación
  responderEvaluacion: async (evaluacionId, respuestas) => {
    const response = await api.post(`/evaluaciones/${evaluacionId}/responder`, {
      respuestas: respuestas.reduce((acc, r) => {
        acc[r.preguntaId] = r.respuestaId;
        return acc;
      }, {})
    });
    return response.data;
  },

  // Eliminar evaluación
  eliminarEvaluacion: async (id) => {
    await api.delete(`/evaluaciones/${id}`);
  }
};