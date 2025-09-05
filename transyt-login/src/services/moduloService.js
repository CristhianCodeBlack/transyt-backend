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

  // Crear módulo con archivo y progreso
  crearModuloConArchivoConProgreso: async (formData, onProgress) => {
    try {
      // 1. Iniciar subida asíncrona
      onProgress(5, 'Iniciando subida...');
      
      const uploadResponse = await api.post('/files/upload-async-progress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 1 minuto para iniciar
      });
      
      const { uploadId } = uploadResponse.data;
      onProgress(10, 'Subida iniciada...');
      
      // 2. Consultar progreso hasta completar
      return new Promise((resolve, reject) => {
        const checkProgress = async () => {
          try {
            const statusResponse = await api.get(`/files/upload-status/${uploadId}`);
            const { status, progress, message, url } = statusResponse.data;
            
            onProgress(progress, message);
            
            if (status === 'completed') {
              // 3. Crear módulo con la URL del archivo
              const moduloData = {
                titulo: formData.get('titulo'),
                tipo: formData.get('tipo'),
                orden: parseInt(formData.get('orden')),
                cursoId: parseInt(formData.get('cursoId')),
                contenido: url // URL del archivo subido
              };
              
              onProgress(95, 'Creando módulo...');
              const moduloResponse = await api.post('/modulos', moduloData);
              onProgress(100, '¡Completado!');
              resolve(moduloResponse.data);
              
            } else if (status === 'error') {
              reject(new Error(message));
            } else {
              // Continuar consultando
              setTimeout(checkProgress, 1000);
            }
          } catch (error) {
            reject(error);
          }
        };
        
        checkProgress();
      });
      
    } catch (error) {
      throw error;
    }
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