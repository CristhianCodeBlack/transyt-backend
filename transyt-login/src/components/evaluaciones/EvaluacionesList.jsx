import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, Clock, Users, Play } from 'lucide-react';
import { evaluacionService } from '../../services/evaluacionService';
import toast from 'react-hot-toast';
import EvaluacionModal from './EvaluacionModal';
import ResponderEvaluacion from './ResponderEvaluacion';

const EvaluacionesList = ({ cursoId, cursoTitulo, isInstructor = false }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [showResponder, setShowResponder] = useState(false);

  useEffect(() => {
    if (cursoId) {
      loadEvaluaciones();
    }
  }, [cursoId]);

  const loadEvaluaciones = async () => {
    try {
      const data = await evaluacionService.listarPorCurso(cursoId);
      setEvaluaciones(data);
    } catch (error) {
      toast.error('Error al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta evaluación?')) {
      try {
        await evaluacionService.eliminarEvaluacion(id);
        toast.success('Evaluación eliminada exitosamente');
        loadEvaluaciones();
      } catch (error) {
        toast.error('Error al eliminar evaluación');
      }
    }
  };

  const handleEdit = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedEvaluacion(null);
    setShowModal(true);
  };

  const handleResponder = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setShowResponder(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEvaluacion(null);
    loadEvaluaciones();
  };

  const handleResponderClose = () => {
    setShowResponder(false);
    setSelectedEvaluacion(null);
    loadEvaluaciones();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Evaluaciones</h2>
          <p className="text-gray-600">{cursoTitulo}</p>
        </div>
        {isInstructor && (
          <button
            onClick={handleCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Evaluación
          </button>
        )}
      </div>

      {/* Evaluaciones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evaluaciones.map((evaluacion) => (
          <div key={evaluacion.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{evaluacion.titulo}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{evaluacion.descripcion}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                evaluacion.activo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {evaluacion.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {evaluacion.preguntas?.length || 0} preguntas
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {evaluacion.notaMinima}% mínimo
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                Creada: {evaluacion.fechaCreacion}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {isInstructor ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(`/admin/evaluaciones/${evaluacion.id}/resultados`, '_blank')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Ver resultados"
                  >
                    <Users className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(evaluacion)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar evaluación"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evaluacion.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar evaluación"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleResponder(evaluacion)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
                >
                  <Play className="h-4 w-4" />
                  Iniciar Evaluación
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {evaluaciones.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay evaluaciones</h3>
          <p className="text-gray-500 mb-4">
            {isInstructor 
              ? 'Comienza creando la primera evaluación de este curso' 
              : 'Aún no hay evaluaciones disponibles para este curso'
            }
          </p>
          {isInstructor && (
            <button
              onClick={handleCreate}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear Evaluación
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <EvaluacionModal
          evaluacion={selectedEvaluacion}
          cursoId={cursoId}
          onClose={handleModalClose}
        />
      )}

      {showResponder && (
        <ResponderEvaluacion
          evaluacion={selectedEvaluacion}
          onClose={handleResponderClose}
        />
      )}
    </div>
  );
};

export default EvaluacionesList;