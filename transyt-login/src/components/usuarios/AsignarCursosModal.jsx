import React, { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Trash2 } from 'lucide-react';
import { usuariosAdminService } from '../../services/dashboardService';
import { cursoService } from '../../services/cursoService';
import toast from 'react-hot-toast';

const AsignarCursosModal = ({ usuario, onClose }) => {
  const [cursosDisponibles, setCursosDisponibles] = useState([]);
  const [cursosAsignados, setCursosAsignados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cursos, cursosAsignados] = await Promise.all([
        cursoService.listarCursosDTO(),
        usuariosAdminService.getCursosUsuario(usuario.id)
      ]);
      
      setCursosDisponibles(cursos);
      setCursosAsignados(cursosAsignados);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async (curso) => {
    try {
      await usuariosAdminService.asignarCurso(usuario.id, curso.id);
      setCursosAsignados(prev => [...prev, {
        id: curso.id,
        titulo: curso.titulo,
        descripcion: curso.descripcion,
        fechaAsignacion: new Date().toISOString().split('T')[0],
        progreso: 0,
        completado: false
      }]);
      toast.success(`Curso "${curso.titulo}" asignado exitosamente`);
    } catch (error) {
      toast.error('Error al asignar curso');
    }
  };

  const handleDesasignar = async (cursoId) => {
    try {
      await usuariosAdminService.desasignarCurso(usuario.id, cursoId);
      setCursosAsignados(prev => prev.filter(c => c.id !== cursoId));
      toast.success('Curso desasignado exitosamente');
    } catch (error) {
      toast.error('Error al desasignar curso');
    }
  };

  const cursosNoAsignados = cursosDisponibles.filter(
    curso => !cursosAsignados.some(asignado => asignado.id === curso.id)
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Asignar Cursos</h2>
              <p className="text-sm text-gray-600">{usuario.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cursos Asignados */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cursos Asignados ({cursosAsignados.length})
              </h3>
              
              {cursosAsignados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay cursos asignados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cursosAsignados.map((curso) => (
                    <div key={curso.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{curso.titulo}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Asignado: {curso.fechaAsignacion}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDesasignar(curso.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Desasignar curso"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cursos Disponibles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cursos Disponibles ({cursosNoAsignados.length})
              </h3>
              
              {cursosNoAsignados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Todos los cursos están asignados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cursosNoAsignados.map((curso) => (
                    <div key={curso.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{curso.titulo}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {curso.descripcion}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Creado: {curso.fechaCreacion}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAsignar(curso)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Asignar curso"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsignarCursosModal;