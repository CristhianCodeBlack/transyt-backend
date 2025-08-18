import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const CapacitacionesEmpleado = () => {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCapacitaciones();
  }, []);

  const loadCapacitaciones = async () => {
    try {
      const empresaId = 1; // Obtener de contexto/auth
      const response = await fetch(`http://localhost:8080/api/capacitaciones-vivo/empresa/${empresaId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo capacitaciones de cursos asignados al usuario
        setCapacitaciones(data);
      } else {
        throw new Error('Error al cargar capacitaciones');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar capacitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleUnirse = (enlaceTeams) => {
    window.open(enlaceTeams, '_blank');
    toast.success('Abriendo Teams...');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getStatusBadge = (fechaInicio, fechaFin, activo) => {
    const now = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (!activo) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Cancelada</span>;
    }
    
    if (now < inicio) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Próxima</span>;
    } else if (now >= inicio && now <= fin) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">En vivo</span>;
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Finalizada</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Capacitaciones en Vivo</h1>
        <p className="text-gray-600">Únete a capacitaciones virtuales programadas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capacitaciones.length > 0 ? capacitaciones.map((capacitacion) => (
          <div key={capacitacion.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {capacitacion.titulo}
                </h3>
                {getStatusBadge(capacitacion.fechaInicio, capacitacion.fechaFin, capacitacion.activo)}
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
              
              <button
                onClick={() => handleUnirse(capacitacion.enlaceTeams)}
                disabled={!capacitacion.activo}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  capacitacion.activo
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Video className="h-4 w-4" />
                {capacitacion.activo ? 'Unirse a Teams' : 'No disponible'}
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-3 text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay capacitaciones disponibles</h3>
            <p className="text-gray-500">Las capacitaciones aparecerán aquí cuando sean programadas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapacitacionesEmpleado;