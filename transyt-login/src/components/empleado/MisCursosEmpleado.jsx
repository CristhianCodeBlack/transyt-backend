import React, { useState, useEffect } from 'react';
import { BookOpen, Play, CheckCircle, Clock, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import CursoViewer from './CursoViewer';

const MisCursosEmpleado = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  useEffect(() => {
    loadCursos();
  }, []);

  const loadCursos = async () => {
    try {
      const response = await api.get('/curso-usuario/mis-cursos');
      setCursos(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar mis cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarCurso = (cursoId) => {
    setCursoSeleccionado(cursoId);
  };

  const handleGenerarCertificado = async (cursoId) => {
    try {
      // Intentar con endpoint normal primero
      let response;
      try {
        response = await api.post(`/certificados/generar/${cursoId}`);
      } catch (error) {
        // Si falla, intentar con endpoint simple
        response = await api.post(`/certificados/generar-simple/${cursoId}`);
      }
      
      if (response.data.success) {
        toast.success('🏆 ¡Certificado generado exitosamente!');
        loadCursos(); // Recargar para actualizar estado
      } else {
        toast.error(response.data.error || 'Error al generar certificado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar certificado');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si hay un curso seleccionado, mostrar el visor
  if (cursoSeleccionado) {
    return (
      <CursoViewer 
        cursoId={cursoSeleccionado} 
        onBack={() => setCursoSeleccionado(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
        <p className="text-gray-600">Cursos asignados y tu progreso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.length > 0 ? cursos.map((curso, index) => (
          <div key={curso.id || index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{curso.titulo}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  curso.completado 
                    ? 'bg-green-100 text-green-800' 
                    : curso.iniciado
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {curso.completado ? 'Completado' : curso.iniciado ? 'En Progreso' : 'No Iniciado'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{curso.descripcion}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso</span>
                  <span>{curso.progreso || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${curso.progreso || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 mb-4">
                Asignado: {new Date(curso.fechaAsignacion).toLocaleDateString('es-ES')}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleIniciarCurso(curso.cursoId || curso.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {curso.completado ? 'Revisar' : curso.iniciado ? 'Continuar' : 'Iniciar'}
                </button>
                {curso.completado && (
                  <button
                    onClick={() => handleGenerarCertificado(curso.cursoId || curso.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Award className="h-4 w-4" />
                    Certificado
                  </button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-3 text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cursos asignados</h3>
            <p className="text-gray-500">Contacta a tu administrador para que te asigne cursos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCursosEmpleado;