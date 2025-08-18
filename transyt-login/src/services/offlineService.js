import toast from 'react-hot-toast';

class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    this.cachedData = new Map();
    this.downloadedCourses = new Set();
    
    this.initializeEventListeners();
    this.initializeStorage();
  }

  initializeEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });
  }

  initializeStorage() {
    // Cargar datos del localStorage
    const cached = localStorage.getItem('transyt_offline_data');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        Object.entries(data).forEach(([key, value]) => {
          this.cachedData.set(key, value);
        });
      } catch (error) {
        console.error('Error loading offline data:', error);
      }
    }

    const downloaded = localStorage.getItem('transyt_downloaded_courses');
    if (downloaded) {
      try {
        const courses = JSON.parse(downloaded);
        courses.forEach(courseId => this.downloadedCourses.add(courseId));
      } catch (error) {
        console.error('Error loading downloaded courses:', error);
      }
    }
  }

  handleOnline() {
    toast.success('🌐 Conexión restaurada - Sincronizando datos...', {
      duration: 3000,
      icon: '✅'
    });
    
    this.syncOfflineQueue();
    this.syncCachedData();
  }

  handleOffline() {
    toast.error('📱 Modo offline activado - Usando contenido descargado', {
      duration: 5000,
      icon: '📴',
      style: {
        background: '#FEF2F2',
        color: '#DC2626'
      }
    });
  }

  // Descargar curso para modo offline
  async downloadCourse(courseId) {
    if (!this.isOnline) {
      toast.error('Necesitas conexión para descargar cursos');
      return false;
    }

    try {
      const loadingToast = toast.loading('📥 Descargando curso para modo offline...');

      // Obtener datos del curso
      const courseResponse = await fetch(`http://localhost:8080/api/modulo-progreso/curso/${courseId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!courseResponse.ok) throw new Error('Error al obtener curso');
      
      const courseData = await courseResponse.json();

      // Descargar contenido multimedia
      const downloadPromises = [];
      
      courseData.modulos.forEach(modulo => {
        modulo.submodulos.forEach(submodulo => {
          if (submodulo.tipo === 'PDF' || submodulo.tipo === 'VIDEO') {
            downloadPromises.push(this.downloadFile(submodulo.contenido, submodulo.id));
          }
        });
      });

      await Promise.all(downloadPromises);

      // Guardar datos del curso
      this.cachedData.set(`course_${courseId}`, {
        ...courseData,
        downloadedAt: new Date().toISOString(),
        version: 1
      });

      this.downloadedCourses.add(courseId);
      this.saveToStorage();

      toast.dismiss(loadingToast);
      toast.success('✅ Curso descargado para modo offline', {
        duration: 4000,
        icon: '📱'
      });

      return true;
    } catch (error) {
      console.error('Error downloading course:', error);
      toast.error('❌ Error al descargar curso');
      return false;
    }
  }

  // Descargar archivo individual
  async downloadFile(url, fileId) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);
      
      this.cachedData.set(`file_${fileId}`, {
        data: base64,
        type: blob.type,
        size: blob.size,
        downloadedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      return false;
    }
  }

  // Convertir blob a base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Obtener curso desde caché
  getCachedCourse(courseId) {
    return this.cachedData.get(`course_${courseId}`);
  }

  // Obtener archivo desde caché
  getCachedFile(fileId) {
    const cached = this.cachedData.get(`file_${fileId}`);
    if (cached) {
      return cached.data; // Base64 data URL
    }
    return null;
  }

  // Verificar si un curso está descargado
  isCourseDownloaded(courseId) {
    return this.downloadedCourses.has(courseId);
  }

  // Eliminar curso descargado
  removeCourse(courseId) {
    this.downloadedCourses.delete(courseId);
    
    // Eliminar datos del curso
    this.cachedData.delete(`course_${courseId}`);
    
    // Eliminar archivos relacionados
    const courseData = this.cachedData.get(`course_${courseId}`);
    if (courseData) {
      courseData.modulos?.forEach(modulo => {
        modulo.submodulos?.forEach(submodulo => {
          this.cachedData.delete(`file_${submodulo.id}`);
        });
      });
    }

    this.saveToStorage();
    toast.success('🗑️ Curso eliminado del almacenamiento offline');
  }

  // Agregar acción a la cola offline
  addToOfflineQueue(action) {
    this.offlineQueue.push({
      ...action,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    });
    
    localStorage.setItem('transyt_offline_queue', JSON.stringify(this.offlineQueue));
    
    toast('📝 Acción guardada para sincronizar cuando vuelvas online', {
      duration: 3000,
      icon: '💾'
    });
  }

  // Sincronizar cola offline
  async syncOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    const loadingToast = toast.loading('🔄 Sincronizando acciones offline...');
    let syncedCount = 0;

    for (const action of this.offlineQueue) {
      try {
        await this.executeOfflineAction(action);
        syncedCount++;
      } catch (error) {
        console.error('Error syncing action:', error);
      }
    }

    this.offlineQueue = [];
    localStorage.removeItem('transyt_offline_queue');

    toast.dismiss(loadingToast);
    if (syncedCount > 0) {
      toast.success(`✅ ${syncedCount} acciones sincronizadas`, {
        duration: 3000
      });
    }
  }

  // Ejecutar acción offline
  async executeOfflineAction(action) {
    const { type, data } = action;
    
    switch (type) {
      case 'mark_submodule_completed':
        await fetch(`http://localhost:8080/api/modulo-progreso/submodulo/${data.submoduloId}/marcar-visto`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        break;
        
      case 'complete_module':
        await fetch(`http://localhost:8080/api/modulo-progreso/modulo/${data.moduloId}/completar`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        break;
        
      default:
        console.warn('Unknown offline action type:', type);
    }
  }

  // Sincronizar datos cacheados
  async syncCachedData() {
    // Verificar si hay actualizaciones en los cursos descargados
    for (const courseId of this.downloadedCourses) {
      try {
        const response = await fetch(`http://localhost:8080/api/modulo-progreso/curso/${courseId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (response.ok) {
          const serverData = await response.json();
          const cachedData = this.cachedData.get(`course_${courseId}`);
          
          // Comparar versiones o fechas de modificación
          if (!cachedData || this.needsUpdate(cachedData, serverData)) {
            this.cachedData.set(`course_${courseId}`, {
              ...serverData,
              downloadedAt: new Date().toISOString(),
              version: (cachedData?.version || 0) + 1
            });
          }
        }
      } catch (error) {
        console.error(`Error syncing course ${courseId}:`, error);
      }
    }
    
    this.saveToStorage();
  }

  needsUpdate(cached, server) {
    // Lógica simple de comparación - se puede mejorar
    return JSON.stringify(cached.modulos) !== JSON.stringify(server.modulos);
  }

  // Guardar en localStorage
  saveToStorage() {
    try {
      const dataToSave = {};
      this.cachedData.forEach((value, key) => {
        dataToSave[key] = value;
      });
      
      localStorage.setItem('transyt_offline_data', JSON.stringify(dataToSave));
      localStorage.setItem('transyt_downloaded_courses', JSON.stringify([...this.downloadedCourses]));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Obtener estadísticas de almacenamiento
  getStorageStats() {
    const totalSize = new Blob([localStorage.getItem('transyt_offline_data') || '']).size;
    const coursesCount = this.downloadedCourses.size;
    const filesCount = Array.from(this.cachedData.keys()).filter(key => key.startsWith('file_')).length;
    
    return {
      totalSize: this.formatBytes(totalSize),
      coursesCount,
      filesCount,
      isOnline: this.isOnline
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Limpiar todo el almacenamiento offline
  clearAllOfflineData() {
    this.cachedData.clear();
    this.downloadedCourses.clear();
    this.offlineQueue = [];
    
    localStorage.removeItem('transyt_offline_data');
    localStorage.removeItem('transyt_downloaded_courses');
    localStorage.removeItem('transyt_offline_queue');
    
    toast.success('🧹 Datos offline eliminados');
  }
}

export const offlineService = new OfflineService();
export default offlineService;