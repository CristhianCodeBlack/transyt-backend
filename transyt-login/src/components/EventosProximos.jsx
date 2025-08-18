import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const EventosProximos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventosProximos();
  }, []);

  const loadEventosProximos = async () => {
    try {
      const response = await api.get('/eventos/proximos');
      setEventos(response.data);
    } catch (error) {
      console.error('Error loading upcoming events:', error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleInscribirse = async (eventoId) => {
    try {
      await api.post(`/eventos/${eventoId}/inscribir`);
      toast.success('¡Inscripción exitosa!');
      loadEventosProximos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al inscribirse');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-dark-600">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-dark-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-dark-600">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Próximos Eventos</h3>
      </div>

      {eventos.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No hay eventos próximos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((evento) => (
            <div
              key={evento.id}
              className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                evento.tipo === 'VIRTUAL'
                  ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
                  : evento.tipo === 'HIBRIDO'
                  ? 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                    {evento.titulo}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                    {evento.descripcion}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(evento.fechaInicio)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate max-w-20">{evento.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {evento.asistentesActuales}/{evento.maxAsistentes}
                    </div>
                  </div>
                  
                  {evento.instructor && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Instructor: {evento.instructor}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    evento.tipo === 'VIRTUAL'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : evento.tipo === 'HIBRIDO'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>
                    {evento.tipo === 'VIRTUAL' ? 'Virtual' : evento.tipo === 'HIBRIDO' ? 'Híbrido' : 'Presencial'}
                  </span>
                  
                  {evento.asistentesActuales < evento.maxAsistentes && (
                    <button
                      onClick={() => handleInscribirse(evento.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" />
                      Inscribirse
                    </button>
                  )}
                  
                  {evento.tipo === 'VIRTUAL' && evento.enlaceVirtual && (
                    <a
                      href={evento.enlaceVirtual}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Unirse
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventosProximos;