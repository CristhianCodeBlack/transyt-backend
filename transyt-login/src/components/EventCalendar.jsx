import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Plus, ChevronLeft, ChevronRight, X, Save, Settings } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import InscripcionesManager from './InscripcionesManager';

const EventCalendar = ({ showCreateButton = true }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInscripciones, setShowInscripciones] = useState(null);
  const userRole = localStorage.getItem('rol');
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
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await api.get(`/eventos/mes/${year}/${month}`);
      
      const eventosFormateados = response.data.map(evento => ({
        id: evento.id,
        title: evento.titulo,
        date: new Date(evento.fechaInicio),
        endDate: new Date(evento.fechaFin),
        instructor: evento.instructor,
        location: evento.ubicacion,
        attendees: evento.asistentesActuales,
        maxAttendees: evento.maxAsistentes,
        type: evento.tipo.toLowerCase(),
        description: evento.descripcion,
        estado: evento.estado,
        enlaceVirtual: evento.enlaceVirtual
      }));
      
      setEvents(eventosFormateados);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Error al cargar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Días del siguiente mes
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (startDate, endDate) => {
    const diffMs = endDate - startDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return diffHours > 0 ? `${diffHours}h ${diffMins}m` : `${diffMins}m`;
  };
  
  const handleInscribirse = async (eventoId) => {
    try {
      await api.post(`/eventos/${eventoId}/inscribir`);
      toast.success('¡Inscripción exitosa!');
      loadEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al inscribirse');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/eventos', newEvent);
      toast.success('Evento creado exitosamente');
      setShowEventModal(false);
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
      loadEvents();
    } catch (error) {
      toast.error('Error al crear evento');
    }
  };

  const openCreateModal = (date = null) => {
    if (date) {
      const dateStr = date.toISOString().slice(0, 16);
      setNewEvent(prev => ({
        ...prev,
        fechaInicio: dateStr,
        fechaFin: dateStr
      }));
    }
    setShowEventModal(true);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-200 dark:border-dark-600 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <h3 className="font-bold">Calendario de Eventos</h3>
          </div>
          {showCreateButton && (
            <button
              onClick={() => openCreateModal()}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Nuevo
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isToday = day.date.toDateString() === today.toDateString();
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day.date)}
                onDoubleClick={() => day.isCurrentMonth && openCreateModal(day.date)}
                className={`p-2 text-sm rounded-lg transition-all duration-200 relative ${
                  !day.isCurrentMonth 
                    ? 'text-gray-300 dark:text-gray-600' 
                    : isSelected
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : isToday
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
                title={day.isCurrentMonth ? 'Doble clic para crear evento' : ''}
              >
                {day.date.getDate()}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Events for selected date */}
        {selectedDate && (
          <div className="border-t border-gray-200 dark:border-dark-600 pt-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">
              Eventos - {selectedDate.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No hay eventos programados</p>
            ) : (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      event.type === 'virtual' 
                        ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.date)} ({formatDuration(event.date, event.endDate)})
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendees}/{event.maxAttendees} asistentes
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Instructor: {event.instructor}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.type === 'virtual'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : event.type === 'hibrido'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {event.type === 'virtual' ? 'Virtual' : event.type === 'hibrido' ? 'Híbrido' : 'Presencial'}
                        </span>
                        
                        {(userRole === 'ADMIN' || userRole === 'INSTRUCTOR') && (
                          <button
                            onClick={() => setShowInscripciones(event.id)}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full transition-colors flex items-center gap-1"
                            title="Gestionar inscripciones"
                          >
                            <Settings className="h-3 w-3" />
                            Gestionar
                          </button>
                        )}
                        
                        {event.attendees < event.maxAttendees && userRole === 'EMPLEADO' && (
                          <button
                            onClick={() => handleInscribirse(event.id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full transition-colors"
                          >
                            Inscribirse
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Crear Evento */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Crear Nuevo Evento</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.titulo}
                    onChange={(e) => setNewEvent({...newEvent, titulo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="Nombre del evento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newEvent.descripcion}
                    onChange={(e) => setNewEvent({...newEvent, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Descripción del evento"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Evento *
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
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent.ubicacion}
                    onChange={(e) => setNewEvent({...newEvent, ubicacion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder={newEvent.tipo === 'VIRTUAL' ? 'Enlace de la reunión' : 'Dirección o sala'}
                  />
                </div>

                {newEvent.tipo !== 'PRESENCIAL' && (
                  <div>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Instructor
                    </label>
                    <input
                      type="text"
                      value={newEvent.instructor}
                      onChange={(e) => setNewEvent({...newEvent, instructor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                      placeholder="Nombre del instructor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max. Asistentes
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={newEvent.maxAsistentes}
                      onChange={(e) => setNewEvent({...newEvent, maxAsistentes: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Crear Evento
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

export default EventCalendar;