import React, { useState, useEffect } from 'react';
import { Download, Trash2, Wifi, WifiOff, HardDrive, RefreshCw } from 'lucide-react';
import offlineService from '../services/offlineService';
import toast from 'react-hot-toast';

const OfflineManager = ({ cursos = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadedCourses, setDownloadedCourses] = useState(new Set());
  const [downloading, setDownloading] = useState(new Set());
  const [storageStats, setStorageStats] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    updateStats();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateStats = () => {
    const stats = offlineService.getStorageStats();
    setStorageStats(stats);
    
    // Actualizar cursos descargados
    const downloaded = new Set();
    cursos.forEach(curso => {
      if (offlineService.isCourseDownloaded(curso.id)) {
        downloaded.add(curso.id);
      }
    });
    setDownloadedCourses(downloaded);
  };

  const handleDownloadCourse = async (curso) => {
    if (!isOnline) {
      toast.error('Necesitas conexión para descargar cursos');
      return;
    }

    setDownloading(prev => new Set([...prev, curso.id]));
    
    try {
      const success = await offlineService.downloadCourse(curso.id);
      if (success) {
        setDownloadedCourses(prev => new Set([...prev, curso.id]));
        updateStats();
      }
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev);
        newSet.delete(curso.id);
        return newSet;
      });
    }
  };

  const handleRemoveCourse = (cursoId) => {
    if (window.confirm('¿Estás seguro de eliminar este curso del almacenamiento offline?')) {
      offlineService.removeCourse(cursoId);
      setDownloadedCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(cursoId);
        return newSet;
      });
      updateStats();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de eliminar todos los datos offline? Esta acción no se puede deshacer.')) {
      offlineService.clearAllOfflineData();
      setDownloadedCourses(new Set());
      updateStats();
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Necesitas conexión para sincronizar');
      return;
    }

    const loadingToast = toast.loading('🔄 Sincronizando datos...');
    
    try {
      await offlineService.syncCachedData();
      updateStats();
      toast.dismiss(loadingToast);
      toast.success('✅ Datos sincronizados correctamente');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('❌ Error al sincronizar datos');
    }
  };

  return (
    <div className="relative">
      {/* Botón de gestión offline */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
        title="Gestión Offline"
      >
        {isOnline ? (
          <Download className="h-6 w-6" />
        ) : (
          <WifiOff className="h-6 w-6 text-orange-300" />
        )}
        {downloadedCourses.size > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {downloadedCourses.size}
          </span>
        )}
      </button>

      {/* Modal de gestión offline */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-bold">Gestión Offline</h3>
                    <div className="flex items-center gap-2 text-sm text-indigo-100">
                      {isOnline ? (
                        <>
                          <Wifi className="h-4 w-4" />
                          <span>Conectado</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-4 w-4" />
                          <span>Sin conexión</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            {storageStats && (
              <div className="p-4 bg-indigo-50 border-b border-indigo-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-indigo-700">{storageStats.coursesCount}</div>
                    <div className="text-indigo-600">Cursos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-indigo-700">{storageStats.totalSize}</div>
                    <div className="text-indigo-600">Almacenado</div>
                  </div>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="p-3 border-b border-gray-100 flex gap-2">
              <button
                onClick={handleSync}
                disabled={!isOnline}
                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Sincronizar
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
              >
                Limpiar todo
              </button>
            </div>

            {/* Lista de cursos */}
            <div className="flex-1 overflow-y-auto">
              {cursos.length === 0 ? (
                <div className="p-8 text-center">
                  <Download className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No hay cursos disponibles</p>
                  <p className="text-gray-400 text-sm">Los cursos aparecerán aquí para descargar</p>
                </div>
              ) : (
                cursos.map((curso) => {
                  const isDownloaded = downloadedCourses.has(curso.id);
                  const isDownloading = downloading.has(curso.id);
                  
                  return (
                    <div
                      key={curso.id}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {curso.titulo}
                          </h4>
                          <p className="text-sm text-gray-600 truncate">
                            {curso.descripcion}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {curso.totalModulos || 0} módulos
                            </span>
                            {isDownloaded && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Descargado
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          {isDownloaded ? (
                            <button
                              onClick={() => handleRemoveCourse(curso.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar descarga"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDownloadCourse(curso)}
                              disabled={!isOnline || isDownloading}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Descargar para offline"
                            >
                              {isDownloading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer con información */}
            <div className="p-3 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-600 text-center">
                💡 Los cursos descargados estarán disponibles sin conexión
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineManager;