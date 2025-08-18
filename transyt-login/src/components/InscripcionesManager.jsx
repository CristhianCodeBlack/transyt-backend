import React, { useState, useEffect } from 'react';
import { Users, Check, X, Clock, MessageSquare } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const InscripcionesManager = ({ eventoId, onClose }) => {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    if (eventoId) {
      loadInscripciones();
    }
  }, [eventoId]);

  const loadInscripciones = async () => {
    try {
      const response = await api.get(`/eventos/${eventoId}/inscripciones`);
      setInscripciones(response.data);
    } catch (error) {
      toast.error('Error al cargar inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const aprobarInscripcion = async (inscripcionId) => {
    try {
      await api.put(`/eventos/inscripciones/${inscripcionId}/aprobar`);
      toast.success('Inscripción aprobada');
      loadInscripciones();
    } catch (error) {
      toast.error('Error al aprobar inscripción');
    }
  };

  const rechazarInscripcion = async (inscripcionId) => {
    try {
      await api.put(`/eventos/inscripciones/${inscripcionId}/rechazar`, {
        comentarios
      });
      toast.success('Inscripción rechazada');
      setShowRejectModal(null);
      setComentarios('');
      loadInscripciones();
    } catch (error) {
      toast.error('Error al rechazar inscripción');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'APROBADA': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'RECHAZADA': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-4xl mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-dark-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6" />
                <div>
                  <h2 className="text-xl font-bold">Gestión de Inscripciones</h2>
                  <p className="text-blue-100">Total: {inscripciones.length} inscripciones</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {inscripciones.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No hay inscripciones para este evento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inscripciones.map((inscripcion) => (
                  <div
                    key={inscripcion.id}
                    className="bg-gray-50 dark:bg-dark-700 rounded-xl p-4 border border-gray-200 dark:border-dark-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                          {inscripcion.usuario?.nombre?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {inscripcion.usuario?.nombre || 'Usuario'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {inscripcion.usuario?.correo || 'Sin email'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Inscrito: {new Date(inscripcion.fechaInscripcion).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(inscripcion.estado)}`}>
                          {inscripcion.estado}
                        </span>

                        {inscripcion.estado === 'PENDIENTE' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => aprobarInscripcion(inscripcion.id)}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                              title="Aprobar"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowRejectModal(inscripcion.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              title="Rechazar"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {inscripcion.estado !== 'PENDIENTE' && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            {inscripcion.fechaAprobacion && 
                              new Date(inscripcion.fechaAprobacion).toLocaleDateString('es-ES')
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    {inscripcion.comentarios && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            {inscripcion.comentarios}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Rechazar Inscripción
            </h3>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Motivo del rechazo (opcional)"
              className="w-full p-3 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => rechazarInscripcion(showRejectModal)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Rechazar
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setComentarios('');
                }}
                className="flex-1 bg-gray-300 dark:bg-dark-600 hover:bg-gray-400 dark:hover:bg-dark-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InscripcionesManager;