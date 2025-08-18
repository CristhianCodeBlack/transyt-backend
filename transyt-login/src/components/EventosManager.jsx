import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Users, MapPin, Clock, Search, Filter, Settings } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import InscripcionesManager from './InscripcionesManager';

const EventosManager = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('TODOS');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showInscripciones, setShowInscripciones] = useState(null);
  const [newEvent, setNewEvent] = useState({
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    ubicacion: '',
    instructor: '',
    maxAsistentes: 20,
    tipo: 'PRESENCIAL',
    enlaceVirtual: ''
  });

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      const response = await api.get('/eventos');
      setEventos(response.data);
    } catch (error) {
      toast.error('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/eventos', newEvent);
      toast.success('Evento creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadEventos();
    } catch (error) {
      toast.error('Error al crear evento');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/eventos/${editingEvent.id}`, newEvent);
      toast.success('Evento actualizado exitosamente');
      setEditingEvent(null);
      resetForm();
      loadEventos();
    } catch (error) {
      toast.error('Error al actualizar evento');
    }
  };

  const handleDeleteEvent = async (eventoId) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      try {
        await api.delete(`/eventos/${eventoId}`);
        toast.success('Evento eliminado exitosamente');
        loadEventos();
      } catch (error) {
        toast.error('Error al eliminar evento');
      }
    }
  };

  const resetForm = () => {
    setNewEvent({
      titulo: '',
      descripcion: '',
      fechaInicio: '',
      fechaFin: '',
      ubicacion: '',
      instructor: '',
      maxAsistentes: 20,
      tipo: 'PRESENCIAL',
      enlaceVirtual: ''
    });
  };

  const openEditModal = (evento) => {
    setNewEvent({
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fechaInicio: new Date(evento.fechaInicio).toISOString().slice(0, 16),
      fechaFin: new Date(evento.fechaFin).toISOString().slice(0, 16),
      ubicacion: evento.ubicacion,
      instructor: evento.instructor,
      maxAsistentes: evento.maxAsistentes,
      tipo: evento.tipo,
      enlaceVirtual: evento.enlaceVirtual || ''
    });
    setEditingEvent(evento);
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

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'COMPLETADO': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'EN_CURSO': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'CANCELADO': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-dark-600 rounded"></div>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Gestión de Eventos
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Administra eventos y capacitaciones</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear Evento
            </button>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-600 overflow-hidden">
        {filteredEventos.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No hay eventos que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-dark-600">
            {filteredEventos.map((evento) => (
              <div key={evento.id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {evento.titulo}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {evento.descripcion}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(evento.fechaInicio).toLocaleDateString('es-ES')} - {new Date(evento.fechaInicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {evento.ubicacion}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {evento.asistentesActuales || 0}/{evento.maxAsistentes}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(evento.tipo)}`}>
                            {evento.tipo}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evento.estado)}`}>
                            {evento.estado}
                          </span>
                          {evento.instructor && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Instructor: {evento.instructor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setShowInscripciones(evento.id)}
                      className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      title="Gestionar inscripciones"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(evento)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar evento"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evento.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Eliminar evento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Crear/Editar Evento */}
      {(showCreateModal || editingEvent) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
              </h3>

              <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={newEvent.titulo}
                      onChange={(e) => setNewEvent({...newEvent, titulo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={newEvent.descripcion}
                      onChange={(e) => setNewEvent({...newEvent, descripcion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fecha Inicio *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.fechaInicio}
                      onChange={(e) => setNewEvent({...newEvent, fechaInicio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Fecha Fin *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.fechaFin}
                      onChange={(e) => setNewEvent({...newEvent, fechaFin: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={newEvent.tipo}
                      onChange={(e) => setNewEvent({...newEvent, tipo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    >
                      <option value="PRESENCIAL">Presencial</option>
                      <option value="VIRTUAL">Virtual</option>
                      <option value="HIBRIDO">Híbrido</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max. Asistentes *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      required
                      value={newEvent.maxAsistentes}
                      onChange={(e) => setNewEvent({...newEvent, maxAsistentes: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ubicación *
                    </label>
                    <input
                      type="text"
                      required
                      value={newEvent.ubicacion}
                      onChange={(e) => setNewEvent({...newEvent, ubicacion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={newEvent.instructor}
                      onChange={(e) => setNewEvent({...newEvent, instructor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {newEvent.tipo !== 'PRESENCIAL' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Enlace Virtual
                      </label>
                      <input
                        type="url"
                        value={newEvent.enlaceVirtual}
                        onChange={(e) => setNewEvent({...newEvent, enlaceVirtual: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
                  >
                    {editingEvent ? 'Actualizar' : 'Crear'} Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Gestión de Inscripciones */}
      {showInscripciones && (
        <InscripcionesManager 
          eventoId={showInscripciones}
          onClose={() => setShowInscripciones(null)}
        />
      )}
    </div>
  );
};

export default EventosManager;