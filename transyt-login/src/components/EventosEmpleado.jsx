import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Search, Filter, ExternalLink } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const EventosEmpleado = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('TODOS');

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      const response = await api.get('/eventos');
      // Solo eventos futuros y activos
      const eventosFuturos = response.data.filter(evento => 
        new Date(evento.fechaInicio) > new Date() && evento.estado === 'PROGRAMADO'
      );
      setEventos(eventosFuturos);
    } catch (error) {
      toast.error('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleInscribirse = async (eventoId) => {
    try {
      await api.post(`/eventos/${eventoId}/inscribir`);
      toast.success('¡Inscripción enviada! Pendiente de aprobación');
      loadEventos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al inscribirse');
    }
  };

  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evento.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'TODOS' || evento.tipo === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (tipo) => {
    switch (tipo) {
      case 'VIRTUAL': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'HIBRIDO': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-dark-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-dark-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Eventos Disponibles
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Inscríbete a capacitaciones y eventos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-4 mb-6 border border-gray-100 dark:border-dark-600">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Todos</option>
              <option value="PRESENCIAL">Presencial</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="HIBRIDO">Híbrido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-6">
        {filteredEventos.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-12 text-center border border-gray-100 dark:border-dark-600">
            <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No hay eventos disponibles</p>
            <p className="text-gray-400 dark:text-gray-500">Los eventos aparecerán aquí cuando estén programados</p>
          </div>
        ) : (
          filteredEventos.map((evento) => (
            <div key={evento.id} className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-600 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {evento.titulo}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {evento.descripcion}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(evento.fechaInicio).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(evento.fechaInicio).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(evento.fechaFin).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{evento.ubicacion}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{evento.asistentesActuales || 0}/{evento.maxAsistentes} inscritos</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(evento.tipo)}`}>
                            {evento.tipo === 'VIRTUAL' ? 'Virtual' : evento.tipo === 'HIBRIDO' ? 'Híbrido' : 'Presencial'}
                          </span>
                          {evento.instructor && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Instructor: <span className="font-medium">{evento.instructor}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Date(evento.fechaInicio).getDate()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                        {new Date(evento.fechaInicio).toLocaleDateString('es-ES', { month: 'short' })}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {evento.tipo === 'VIRTUAL' && evento.enlaceVirtual && (
                        <a
                          href={evento.enlaceVirtual}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2 justify-center"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Ver Enlace
                        </a>
                      )}
                      
                      {(evento.asistentesActuales || 0) < evento.maxAsistentes ? (
                        <button
                          onClick={() => handleInscribirse(evento.id)}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 justify-center"
                        >
                          <Users className="h-4 w-4" />
                          Inscribirse
                        </button>
                      ) : (
                        <div className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-lg text-center">
                          Evento Lleno
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventosEmpleado;