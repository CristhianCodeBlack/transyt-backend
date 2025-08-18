import React, { useState, useEffect } from 'react';
import { Plus, Video, Calendar, Clock, Users, ExternalLink, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CapacitacionesVivo = () => {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCapacitacion, setEditingCapacitacion] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const empresaId = 1;
      
      const capacitacionesResponse = await fetch(`http://localhost:8080/api/capacitaciones-vivo/empresa/${empresaId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (capacitacionesResponse.ok) {
        const capacitacionesData = await capacitacionesResponse.json();
        setCapacitaciones(capacitacionesData);
      }
      
      const cursosResponse = await fetch('http://localhost:8080/api/cursos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (cursosResponse.ok) {
        const cursosData = await cursosResponse.json();
        setCursos(cursosData);
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaCapacitacion = () => {
    setEditingCapacitacion(null);
    setShowModal(true);
  };

  const handleEditCapacitacion = (capacitacion) => {
    setEditingCapacitacion(capacitacion);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getStatusBadge = (fechaInicio, activo) => {
    const now = new Date();
    const inicio = new Date(fechaInicio);
    
    if (!activo) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Inactiva</span>;
    }
    
    if (inicio > now) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Programada</span>;
    } else {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">En vivo</span>;
    }
  };

  const handleJoinMeeting = (enlaceTeams) => {
    window.open(enlaceTeams, '_blank');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacitaciones en Vivo</h1>
          <p className="text-gray-600">Gestiona reuniones y capacitaciones virtuales</p>
        </div>
        <button
          onClick={handleNuevaCapacitacion}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Capacitación
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capacitaciones.map((capacitacion) => (
            <div key={capacitacion.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {capacitacion.titulo}
                  </h3>
                  {getStatusBadge(capacitacion.fechaInicio, capacitacion.activo)}
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {capacitacion.descripcion}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {capacitacion.curso}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(capacitacion.fechaInicio)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    Hasta: {formatDate(capacitacion.fechaFin)}
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mb-4">
                  Organizador: {capacitacion.creador}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleJoinMeeting(capacitacion.enlaceTeams)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Unirse
                  </button>
                  <button
                    onClick={() => handleEditCapacitacion(capacitacion)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CapacitacionModal
          capacitacion={editingCapacitacion}
          cursos={cursos}
          onClose={() => {
            setShowModal(false);
            setEditingCapacitacion(null);
          }}
          onSave={() => {
            setShowModal(false);
            setEditingCapacitacion(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};

const CapacitacionModal = ({ capacitacion, cursos, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    titulo: capacitacion?.titulo || '',
    descripcion: capacitacion?.descripcion || '',
    fechaInicio: capacitacion?.fechaInicio ? new Date(capacitacion.fechaInicio).toISOString().slice(0, 16) : '',
    fechaFin: capacitacion?.fechaFin ? new Date(capacitacion.fechaFin).toISOString().slice(0, 16) : '',
    cursoId: capacitacion?.cursoId || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/capacitaciones-vivo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success('Capacitación creada exitosamente');
        onSave();
      } else {
        const errorText = await response.text();
        toast.error('Error: ' + errorText);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error creando capacitación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {capacitacion ? 'Editar Capacitación' : 'Nueva Capacitación'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curso *
            </label>
            <select
              name="cursoId"
              value={formData.cursoId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar curso</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.titulo}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora de Inicio *
            </label>
            <input
              type="datetime-local"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha y Hora de Fin *
            </label>
            <input
              type="datetime-local"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CapacitacionesVivo;