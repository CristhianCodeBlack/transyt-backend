import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, CheckCircle, FileText, Video, Clock, Award, BookOpen, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import offlineService from '../../services/offlineService';
import ResponderEvaluacion from '../evaluaciones/ResponderEvaluacion';


const CursoViewer = ({ cursoId, onBack }) => {
  const [progresoCurso, setProgresoCurso] = useState(null);
  const [moduloActivo, setModuloActivo] = useState(null);
  const [submoduloActivo, setSubmoduloActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showEvaluacion, setShowEvaluacion] = useState(false);
  const [evaluacionActiva, setEvaluacionActiva] = useState(null);

  useEffect(() => {
    if (cursoId) {
      loadProgresoCurso();
    }
    
    // Escuchar cambios de conectividad
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [cursoId]);

  const loadProgresoCurso = async () => {
    try {
      console.log('=== CARGANDO PROGRESO CURSO ===');
      console.log('CursoId:', encodeURIComponent(cursoId || ''));
      console.log('Navigator online:', navigator.onLine);
      
      let data;
      
      // Intentar cargar desde caché offline primero si no hay conexión
      if (!navigator.onLine) {
        const cachedData = offlineService.getCachedCourse(cursoId);
        if (cachedData) {
          data = cachedData;
          toast('📱 Cargando curso desde modo offline', {
            duration: 3000,
            icon: '💾'
          });
        } else {
          throw new Error('Curso no disponible offline');
        }
      } else {
        // Cargar desde servidor
        const response = await api.get(`/modulo-progreso/curso/${cursoId}`);
        data = response.data;
        
        console.log('Datos del progreso cargados desde servidor');
        console.log('Número de módulos:', data.modulos?.length);
        console.log('Progreso general:', encodeURIComponent(data.progresoGeneral + '%'));
      }
      
      console.log('Estableciendo progreso del curso');
      setProgresoCurso(data);
        
        // Seleccionar primer módulo no completado o el primero
        const primerModuloNoCompletado = data.modulos.find(m => !m.completado);
        const moduloInicial = primerModuloNoCompletado || data.modulos[0];
        
        if (moduloInicial) {
          setModuloActivo(moduloInicial);
          if (moduloInicial.submodulos.length > 0) {
            setSubmoduloActivo(moduloInicial.submodulos[0]);
          }
        }
    } catch (error) {
      console.error('Error:', error);
      if (!navigator.onLine) {
        toast.error('📴 Curso no disponible offline. Descárgalo cuando tengas conexión.');
      } else {
        toast.error('❌ Error al cargar el curso');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarModulo = async (moduloId) => {
    try {
      await api.post(`/modulo-progreso/modulo/${moduloId}/iniciar`);
      loadProgresoCurso(); // Recargar progreso
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCompletarModulo = async (moduloId) => {
    try {
      const confirmed = window.confirm('¿Estás seguro de que has completado todos los elementos de este módulo?');
      if (!confirmed) return;
      
      const loadingToast = toast.loading('Finalizando módulo...');
      
      if (!navigator.onLine) {
        // Modo offline: agregar a la cola
        offlineService.addToOfflineQueue({
          type: 'complete_module',
          data: { moduloId }
        });
        
        toast.dismiss(loadingToast);
        toast.success('💾 Módulo marcado offline - Se sincronizará cuando vuelvas online', {
          duration: 4000,
          icon: '📱'
        });
        return;
      }
      
      await api.post(`/modulo-progreso/modulo/${moduloId}/completar`);
      
      toast.dismiss(loadingToast);
        toast.success('🎊 ¡Módulo completado exitosamente!', {
          duration: 4000,
          icon: '🏅'
        });
        
        await loadProgresoCurso(); // Recargar progreso
        
        // Verificar si el curso se completó y mostrar notificación de certificado
        const updatedResponse = await api.get(`/modulo-progreso/curso/${cursoId}`);
        const updatedData = updatedResponse.data;
          if (updatedData.progresoGeneral >= 100) {

            // Mostrar celebración especial para completar el curso
            setTimeout(() => {
              toast.success('🎉🏆 ¡FELICITACIONES! Has completado todo el curso', {
                duration: 8000,
                icon: '🎓',
                style: {
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }
              });
              
              // Segundo toast para el certificado
              setTimeout(() => {
                toast('📜 Tu certificado TRANSYT está listo para descargar', {
                  duration: 6000,
                  icon: '🎖️',
                  style: {
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: 'white',
                    fontWeight: 'bold'
                  }
                });
              }, 2000);
            }, 1000);
          } else {
            // Mostrar progreso restante
            const modulosRestantes = updatedData.totalModulos - updatedData.modulosCompletados;
            if (modulosRestantes > 0) {
              setTimeout(() => {
                toast(`🚀 ¡Excelente progreso! Te quedan ${modulosRestantes} módulos para completar el curso`, {
                  duration: 4000,
                  icon: '📈'
                });
              }, 1500);
            }
          }
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error de conexión al completar módulo');
    }
  };

  const handleMarcarSubmoduloVisto = async (submoduloId) => {
    // Evitar múltiples llamadas simultáneas
    if (window.marcandoSubmudulo) {
      console.log('Ya se está marcando un submódulo, ignorando...');
      return;
    }
    window.marcandoSubmudulo = true;
    
    try {
      console.log('=== MARCANDO SUBMÓDULO COMO VISTO ===');
      console.log('Submódulo ID:', submoduloId);
      console.log('Submódulo activo:', submoduloActivo);
      console.log('Tipo de submódulo:', submoduloActivo?.tipo);
      console.log('Módulo activo:', moduloActivo?.id);
      
      // Si es una evaluación, abrir EvaluacionSimple
      if (submoduloActivo?.tipo === 'EVALUACION') {
        console.log('Es evaluación, abriendo modal...');
        setShowEvaluacion(true);
        return;
      }
      
      const loadingToast = toast.loading('Marcando como completado...');
      
      if (!navigator.onLine) {
        offlineService.addToOfflineQueue({
          type: 'mark_submodule_completed',
          data: { submoduloId }
        });
        
        toast.dismiss(loadingToast);
        toast.success('💾 Marcado offline - Se sincronizará cuando vuelvas online', {
          duration: 4000,
          icon: '📱'
        });
        return;
      }
      
      // Usar la API existente que funciona
      await api.post(`/modulo-progreso/submodulo/${submoduloId}/marcar-visto`);
      
      toast.dismiss(loadingToast);
        
        console.log('Submódulo marcado como completado exitosamente');
        toast.success('🎉 ¡Elemento completado exitosamente!', {
          duration: 3000,
          icon: '✅'
        });
        
        console.log('Recargando progreso del curso...');
        await loadProgresoCurso();
        console.log('Progreso recargado');
        
        // DEBUG: Ver datos del módulo en el backend
        console.log('=== DEBUG MÓDULO BACKEND ===');
        try {
          const debugResponse = await api.get(`/modulo-progreso/debug/modulo/${moduloActivo?.id}`);
          console.log('Datos del módulo en backend:', debugResponse.data);
        } catch (error) {
          console.error('Error en debug:', error);
        }
        
        // Verificar si hay evaluación del módulo automáticamente
        console.log('Verificando evaluación del módulo en 1 segundo...');
        setTimeout(async () => {
          await verificarEvaluacionModulo();
        }, 1000);
        
        setTimeout(() => {
          toast('💡 ¡Siguiente elemento desbloqueado!', {
            icon: '🔓',
            duration: 2000
          });
        }, 500);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al marcar elemento como completado');
    } finally {
      // Liberar el flag
      window.marcandoSubmudulo = false;
    }
  };
  
  const verificarEvaluacionModulo = async () => {
    try {
      console.log('Verificando evaluación para módulo:', moduloActivo?.id);
      
      if (!moduloActivo) return;
      
      // Recargar progreso para obtener estado actualizado
      await loadProgresoCurso();
      
      // Verificar si todos los submódulos del módulo están completados
      const todosSubmodulosCompletados = moduloActivo.submodulos.every(sub => sub.completado);
      console.log('Todos los submódulos completados:', todosSubmodulosCompletados);
      
      if (todosSubmodulosCompletados) {
        // Buscar evaluación del módulo
        const response = await api.get(`/evaluaciones/modulo/${moduloActivo.id}`);
        
        console.log('Respuesta evaluaciones: OK');
        const evaluaciones = response.data;
        console.log('Evaluaciones encontradas:', evaluaciones);
          
          if (evaluaciones && evaluaciones.length > 0) {
            // Hay evaluación, mostrarla
            setTimeout(() => {
              toast('📝 ¡Evaluación del módulo disponible!', {
                duration: 4000,
                icon: '🎓'
              });
              setEvaluacionActiva(evaluaciones[0]);
              setShowEvaluacion(true);
            }, 1000);
          } else {
            console.log('No hay evaluaciones para este módulo');
          }
      }
    } catch (error) {
      console.error('Error verificando evaluación:', error);
    }
  };

  const handleCompletarEvaluacion = async (evaluacionId, puntajeObtenido, puntajeMaximo) => {
    try {
      const response = await api.post(`/modulo-progreso/evaluacion/${evaluacionId}/completar`, 
        `puntajeObtenido=${puntajeObtenido}&puntajeMaximo=${puntajeMaximo}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      toast.success(response.data);
      loadProgresoCurso(); // Recargar progreso
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al registrar evaluación');
    }
  };

  // Función para escuchar mensajes del sistema de evaluaciones
  useEffect(() => {
    const handleEvaluacionCompletada = (event) => {
      if (event.data && event.data.type === 'evaluacion_completada') {
        const { evaluacionId, puntajeObtenido, puntajeMaximo } = event.data;
        handleCompletarEvaluacion(evaluacionId, puntajeObtenido, puntajeMaximo);
      }
    };

    window.addEventListener('message', handleEvaluacionCompletada);
    return () => window.removeEventListener('message', handleEvaluacionCompletada);
  }, []);

  const handleSeleccionarModulo = (modulo) => {
    console.log('=== SELECCIONANDO MÓDULO ===');
    console.log('Módulo seleccionado:', modulo);
    console.log('ID del módulo:', modulo.id);
    console.log('Título:', modulo.titulo);
    console.log('Número de submódulos:', modulo.submodulos?.length);
    console.log('Progreso del módulo:', modulo.porcentajeProgreso + '%');
    console.log('Módulo completado:', modulo.completado);
    
    setModuloActivo(modulo);
    if (modulo.submodulos.length > 0) {
      console.log('Seleccionando primer submódulo:', modulo.submodulos[0]);
      setSubmoduloActivo(modulo.submodulos[0]);
    }
    
    // Iniciar módulo si no ha sido iniciado
    if (!modulo.fechaInicio) {
      console.log('Módulo no iniciado, iniciando...');
      handleIniciarModulo(modulo.id);
    } else {
      console.log('Módulo ya iniciado en:', modulo.fechaInicio);
    }
  };

  const handleSeleccionarSubmodulo = (submodulo) => {
    console.log('=== SELECCIONANDO SUBMÓDULO ===');
    console.log('Submódulo seleccionado:', submodulo);
    console.log('ID:', submodulo.id);
    console.log('Título:', submodulo.titulo);
    console.log('Tipo:', submodulo.tipo);
    console.log('Completado:', submodulo.completado);
    console.log('Contenido URL:', submodulo.contenido);
    
    // Verificar si el submódulo está disponible
    const disponible = esSubmoduloDisponible(submodulo);
    console.log('Submódulo disponible:', disponible);
    
    if (!disponible) {
      console.log('Submódulo bloqueado, mostrando error');
      toast.error('🔒 Debes completar los elementos anteriores primero', {
        duration: 4000,
        icon: '⚠️',
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA'
        }
      });
      return;
    }
    
    console.log('Estableciendo submódulo activo');
    setSubmoduloActivo(submodulo);
    
    // Mostrar toast informativo sobre el tipo de contenido
    const tipoMensajes = {
      'VIDEO': '🎥 Reproduciendo video educativo',
      'PDF': '📄 Cargando documento PDF',
      'EVALUACION': '📝 Preparando evaluación',
      'TEXTO': '📖 Cargando contenido de texto'
    };
    
    const mensaje = tipoMensajes[submodulo.tipo] || '📚 Cargando contenido';
    toast(mensaje, {
      duration: 2000,
      icon: '📖'
    });
  };
  
  const esSubmoduloDisponible = (submoduloTarget) => {
    if (!moduloActivo || !moduloActivo.submodulos) {
      console.log('❌ No hay módulo activo o submódulos');
      return false;
    }
    
    // El primer submódulo siempre está disponible
    if (moduloActivo.submodulos[0]?.id === submoduloTarget.id) {
      console.log('✅ Primer submódulo - siempre disponible:', submoduloTarget.titulo);
      return true;
    }
    
    // Encontrar el índice del submódulo objetivo
    const targetIndex = moduloActivo.submodulos.findIndex(sub => sub.id === submoduloTarget.id);
    if (targetIndex === -1) {
      console.log('❌ Submódulo no encontrado:', submoduloTarget.titulo);
      return false;
    }
    
    console.log(`🔍 Verificando submódulo "${submoduloTarget.titulo}" (índice ${targetIndex})`);
    
    // Verificar que TODOS los submódulos anteriores estén completados
    for (let i = 0; i < targetIndex; i++) {
      const sub = moduloActivo.submodulos[i];
      console.log(`  - Submódulo ${i}: "${sub.titulo}" completado: ${sub.completado}`);
      if (!sub.completado) {
        console.log(`❌ Submódulo "${submoduloTarget.titulo}" BLOQUEADO - "${sub.titulo}" no completado`);
        return false; // Submódulo anterior no completado
      }
    }
    
    console.log(`✅ Submódulo "${submoduloTarget.titulo}" DISPONIBLE - todos los anteriores completados`);
    return true; // Todos los anteriores están completados
  };

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'VIDEO': return <Video className="h-4 w-4" />;
      case 'PDF': return <FileText className="h-4 w-4" />;
      case 'EVALUACION': return <CheckCircle className="h-4 w-4" />;
      case 'TEXTO': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Función para verificar si todos los elementos del módulo están completados
  const verificarElementosCompletados = (modulo) => {
    if (!modulo || !modulo.submodulos) return false;
    
    // Verificar que TODOS los submódulos estén completados
    const todosCompletados = modulo.submodulos.every(sub => sub.completado === true);
    
    return todosCompletados;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando tu curso TRANSYT...</p>
          <div className="mt-2 text-sm text-gray-500">Preparando contenido educativo</div>
        </div>
      </div>
    );
  }

  if (!progresoCurso) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudo cargar el curso</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">TRANSYT - Curso en Progreso</h1>
                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <span className="bg-white/20 px-2 py-1 rounded-lg">
                    {progresoCurso.modulosCompletados}/{progresoCurso.totalModulos} módulos
                  </span>
                  <span className="bg-white/20 px-2 py-1 rounded-lg">
                    {progresoCurso.progresoGeneral}% completado
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-blue-100 mb-1">Progreso General</div>
              <div className="flex items-center gap-3">
                <div className="w-40 bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-green-400 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${progresoCurso.progresoGeneral}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold min-w-[3rem]">{progresoCurso.progresoGeneral}%</span>
              </div>
            </div>
            {progresoCurso.progresoGeneral >= 100 && (
              <button 
                onClick={() => window.setEmpleadoTab('certificados')}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 animate-pulse"
              >
                <Award className="h-5 w-5" />
                ¡Ver Certificado!
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Lista de módulos */}
        <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 border-r overflow-y-auto shadow-inner">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-gray-900">Módulos del Curso</h2>
            </div>
            <div className="space-y-2">
              {progresoCurso.modulos.map((modulo) => (
                <div key={modulo.id} className="bg-white rounded-lg border">
                  <button
                    onClick={() => handleSeleccionarModulo(modulo)}
                    className={`w-full p-4 text-left rounded-xl transition-all duration-200 ${
                      moduloActivo?.id === modulo.id 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg transform scale-105' 
                        : 'hover:bg-white hover:shadow-md hover:scale-102'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{modulo.titulo}</h3>
                      <div className="flex items-center gap-2">
                        {modulo.completado ? (
                          <div className="bg-emerald-100 p-1 rounded-full">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="bg-gray-100 p-1 rounded-full">
                            <Clock className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{modulo.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {modulo.totalSubmodulos} elementos
                      </span>
                      <span className="text-xs text-gray-500">
                        {modulo.porcentajeProgreso}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${modulo.porcentajeProgreso}%` }}
                      ></div>
                    </div>
                  </button>
                  
                  {/* Submódulos */}
                  {moduloActivo?.id === modulo.id && modulo.submodulos.length > 0 && (
                    <div className="border-t bg-gray-50">
                      {modulo.submodulos.map((submodulo, index) => {
                        const disponible = esSubmoduloDisponible(submodulo);
                        const esActivo = submoduloActivo?.id === submodulo.id;
                        
                        return (
                          <button
                            key={submodulo.id}
                            onClick={() => handleSeleccionarSubmodulo(submodulo)}
                            disabled={!disponible}
                            className={`w-full p-3 text-left text-sm flex items-center gap-3 transition-all duration-200 ${
                              !disponible 
                                ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-500 cursor-not-allowed border-l-4 border-red-400 opacity-60'
                                : esActivo 
                                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-l-4 border-blue-500 shadow-md' 
                                : submodulo.completado
                                ? 'bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-l-4 border-emerald-400'
                                : 'hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 border-l-4 border-transparent hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`p-1 rounded-lg ${
                                !disponible ? 'bg-red-100' :
                                submodulo.completado ? 'bg-emerald-100' :
                                esActivo ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                {getIconoTipo(submodulo.tipo)}
                              </div>
                              {submodulo.completado && (
                                <div className="bg-emerald-500 rounded-full p-0.5">
                                  <CheckCircle className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                            <span className="flex-1">{submodulo.titulo}</span>
                            <div className="flex items-center gap-1">
                              {!disponible && (
                                <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                                  <Clock className="h-3 w-3 text-red-500" />
                                  <span className="text-xs font-medium text-red-600">Bloqueado</span>
                                </div>
                              )}
                              {disponible && !submodulo.completado && (
                                <div className="bg-blue-100 px-2 py-1 rounded-full">
                                  <span className="text-xs font-medium text-blue-600">Disponible</span>
                                </div>
                              )}
                              {submodulo.completado && (
                                <div className="bg-emerald-100 px-2 py-1 rounded-full">
                                  <span className="text-xs font-medium text-emerald-600">Completado</span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
          {submoduloActivo ? (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                      {submoduloActivo.titulo}
                    </h1>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        {getIconoTipo(submoduloActivo.tipo)}
                      </div>
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {submoduloActivo.tipo.toLowerCase()}
                      </span>
                      {submoduloActivo.completado && (
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Completado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  {submoduloActivo.tipo === 'PDF' ? (
                    <div>
                      <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
                        <object
                          data={`${!navigator.onLine ? offlineService.getCachedFile(submoduloActivo.id) || submoduloActivo.contenido : submoduloActivo.contenido}#toolbar=1&navpanes=1&scrollbar=1`}
                          type="application/pdf"
                          className="w-full h-full"
                        >
                          <div className="flex flex-col items-center justify-center h-full p-8">
                            <FileText className="h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se puede mostrar el PDF</h3>
                            <p className="text-gray-600 mb-4">Tu navegador no soporta la visualización de PDFs</p>
                            <a
                              href={!navigator.onLine ? offlineService.getCachedFile(submoduloActivo.id) || submoduloActivo.contenido : submoduloActivo.contenido}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                            >
                              <FileText className="h-5 w-5" />
                              Abrir PDF en Nueva Ventana
                            </a>
                          </div>
                        </object>
                      </div>
                      <div className="p-6 text-center border-t bg-gradient-to-r from-gray-50 to-blue-50">
                        <button
                          onClick={() => handleMarcarSubmoduloVisto(submoduloActivo.id)}
                          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                          <CheckCircle className="h-5 w-5" />
                          Marcar PDF como Leído
                        </button>
                      </div>
                    </div>
                  ) : submoduloActivo.tipo === 'VIDEO' ? (
                    <div className="p-4">
                      <video
                        ref={(video) => {
                          if (video) {
                            let maxTime = 0;
                            let canComplete = false;
                            
                            video.addEventListener('timeupdate', () => {
                              // Control de reproducción secuencial
                              if (video.currentTime > maxTime + 0.5) {
                                console.log('Usuario intentó saltar adelante, regresando a:', maxTime);
                                video.currentTime = maxTime;
                              } else if (video.currentTime > maxTime) {
                                maxTime = video.currentTime;
                              }
                              
                              // Permitir completar si ve más del 90%
                              const porcentajeVisto = video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0;
                              
                              if (video.duration > 0 && video.currentTime / video.duration >= 0.9) {
                                if (!canComplete) {
                                  console.log('=== VIDEO 90% COMPLETADO ===');
                                  console.log('Duración total:', video.duration);
                                  console.log('Tiempo actual:', video.currentTime);
                                  console.log('Porcentaje visto:', porcentajeVisto.toFixed(2) + '%');
                                  console.log('Habilitando botón de completar');
                                  canComplete = true;
                                }
                                
                                const completarBtn = document.getElementById('completar-video-btn');
                                if (completarBtn && !submoduloActivo.completado) {
                                  completarBtn.style.display = 'block';
                                }
                              }
                              
                              // Log cada 10% para seguimiento
                              if (Math.floor(porcentajeVisto / 10) !== Math.floor((porcentajeVisto - 1) / 10)) {
                                console.log('Progreso video:', Math.floor(porcentajeVisto / 10) * 10 + '%');
                              }
                            });
                            
                            video.addEventListener('seeking', () => {
                              if (video.currentTime > maxTime + 0.5) {
                                video.currentTime = maxTime;
                              }
                            });
                            
                            video.addEventListener('ended', () => {
                              console.log('=== VIDEO TERMINADO ===');
                              console.log('Video duration:', video.duration);
                              console.log('Current time:', video.currentTime);
                              console.log('Max time reached:', maxTime);
                              console.log('Can complete:', canComplete);
                              console.log('Submódulo activo:', submoduloActivo);
                              
                              if (canComplete) {
                                console.log('Marcando video como completado...');
                                toast.success('🎬 ¡Video completado!');
                                handleMarcarSubmoduloVisto(submoduloActivo.id);
                              } else {
                                console.log('No se puede completar - canComplete es false');
                              }
                            });
                          }
                        }}
                        controls
                        controlsList="nodownload"
                        className="w-full max-h-96 rounded-lg"
                        src={!navigator.onLine ? offlineService.getCachedFile(submoduloActivo.id) || submoduloActivo.contenido : submoduloActivo.contenido}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        Tu navegador no soporta video HTML5.
                      </video>
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="font-medium">🔒 Video protegido - Reproducción secuencial obligatoria</span>
                            {!navigator.onLine && (
                              <div className="ml-auto flex items-center gap-1 text-orange-600">
                                <WifiOff className="h-3 w-3" />
                                <span className="text-xs">Offline</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-blue-600 mt-1 ml-4">
                            El video se marcará como completado automáticamente al finalizar
                          </div>
                        </div>
                        
                        {/* Botón para completar video manualmente (aparece al 90%) */}
                        {!submoduloActivo.completado && (
                          <div className="text-center">
                            <button
                              id="completar-video-btn"
                              onClick={() => {
                                console.log('=== BOTÓN COMPLETAR VIDEO MANUAL ===');
                                console.log('Submódulo activo:', submoduloActivo);
                                console.log('ID del submódulo:', submoduloActivo.id);
                                toast.success('🎬 ¡Video completado!');
                                handleMarcarSubmoduloVisto(submoduloActivo.id);
                              }}
                              style={{ display: 'none' }}
                              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <CheckCircle className="h-4 w-4" />
                              ¡Marcar Video como Completado!
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : submoduloActivo.tipo === 'EVALUACION' ? (
                    <div className="p-6">
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{submoduloActivo.titulo}</h3>
                        {submoduloActivo.descripcion && (
                          <p className="text-gray-600 mb-4">{submoduloActivo.descripcion}</p>
                        )}
                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                          <p className="text-sm text-blue-800">
                            <strong>Nota mínima para aprobar:</strong> 70%
                          </p>
                        </div>
                        <button 
                          onClick={async () => {
                            console.log('=== INICIANDO EVALUACIÓN ===');
                            console.log('Módulo activo:', moduloActivo?.id);
                            console.log('Submódulo activo:', submoduloActivo?.id);
                            
                            try {
                              const response = await api.get(`/evaluaciones/modulo/${moduloActivo.id}`);
                              
                              console.log('Respuesta API evaluaciones: OK');
                              const evaluaciones = response.data;
                              console.log('Evaluaciones obtenidas:', evaluaciones);
                              
                              if (evaluaciones && evaluaciones.length > 0) {
                                console.log('Abriendo evaluación:', evaluaciones[0]);
                                setEvaluacionActiva(evaluaciones[0]);
                                setShowEvaluacion(true);
                                toast.success('📝 Abriendo evaluación');
                              } else {
                                console.log('No hay evaluaciones para este módulo');
                                toast('No hay evaluación para este módulo', { icon: 'ℹ️' });
                              }
                            } catch (error) {
                              console.error('Error completo:', error);
                              toast.error('Error al cargar evaluación');
                            }
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                          <div className="bg-white/20 p-2 rounded-lg">
                            <Play className="h-6 w-6" />
                          </div>
                          Iniciar Evaluación
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: submoduloActivo.contenido || '<p>Contenido no disponible</p>' }} />
                      </div>
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => handleMarcarSubmoduloVisto(submoduloActivo.id)}
                          className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        >
                          <CheckCircle className="h-5 w-5" />
                          Marcar como Completado
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Navegación entre submódulos */}
                <div className="mt-8">
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                    {/* Navegación anterior/siguiente */}
                    <div className="flex justify-between items-center mb-6">
                      <button
                        onClick={() => {
                          const currentIndex = moduloActivo.submodulos.findIndex(s => s.id === submoduloActivo.id);
                          if (currentIndex > 0) {
                            const prevSubmodulo = moduloActivo.submodulos[currentIndex - 1];
                            handleSeleccionarSubmodulo(prevSubmodulo);
                          }
                        }}
                        disabled={moduloActivo.submodulos.findIndex(s => s.id === submoduloActivo.id) === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Anterior</span>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        {moduloActivo.submodulos.map((sub, index) => {
                          const isActive = sub.id === submoduloActivo.id;
                          const isCompleted = sub.completado;
                          const isAvailable = esSubmoduloDisponible(sub);
                          
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleSeleccionarSubmodulo(sub)}
                              disabled={!isAvailable}
                              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                isActive 
                                  ? 'bg-blue-500 scale-125 shadow-lg' 
                                  : isCompleted 
                                  ? 'bg-emerald-500 hover:scale-110' 
                                  : isAvailable 
                                  ? 'bg-gray-300 hover:bg-gray-400 hover:scale-110' 
                                  : 'bg-red-300 opacity-50 cursor-not-allowed'
                              }`}
                              title={`${sub.titulo} - ${isCompleted ? 'Completado' : isAvailable ? 'Disponible' : 'Bloqueado'}`}
                            />
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => {
                          const currentIndex = moduloActivo.submodulos.findIndex(s => s.id === submoduloActivo.id);
                          if (currentIndex < moduloActivo.submodulos.length - 1) {
                            const nextSubmodulo = moduloActivo.submodulos[currentIndex + 1];
                            handleSeleccionarSubmodulo(nextSubmodulo);
                          }
                        }}
                        disabled={moduloActivo.submodulos.findIndex(s => s.id === submoduloActivo.id) === moduloActivo.submodulos.length - 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <span className="text-sm font-medium">Siguiente</span>
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </button>
                    </div>
                    
                    {/* Progreso y acción principal */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-gray-700">
                            Progreso del módulo:
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-40 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${moduloActivo.porcentajeProgreso}%` }}
                            ></div>
                          </div>
                          <span className="text-lg font-bold text-blue-600 min-w-[3rem]">
                            {moduloActivo.porcentajeProgreso}%
                          </span>
                        </div>
                      </div>
                      <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 flex items-center gap-2 shadow-md">
                        <BookOpen className="h-5 w-5" />
                        <span className="font-medium">Progreso: {moduloActivo.porcentajeProgreso}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BookOpen className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                  ¡Comienza tu aprendizaje!
                </h3>
                <p className="text-gray-600 text-lg mb-4">Selecciona un módulo del menú lateral para comenzar</p>
                <div className="bg-blue-50 rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Los módulos se desbloquean secuencialmente conforme completes el contenido
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Evaluación */}
      {showEvaluacion && evaluacionActiva && (
        <ResponderEvaluacion 
          evaluacion={evaluacionActiva}
          onClose={() => {
            setShowEvaluacion(false);
            setEvaluacionActiva(null);
            loadProgresoCurso();
          }}
        />
      )}
    </div>
  );
};

export default CursoViewer;