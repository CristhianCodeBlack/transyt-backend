import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Clock, TrendingUp, Play, Download, Video, Users, Home, CheckCircle, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import MisCursosEmpleado from '../../components/empleado/MisCursosEmpleado';
import MisCertificadosEmpleado from '../../components/empleado/MisCertificadosEmpleado';
import EventosEmpleado from '../../components/EventosEmpleado';

import CapacitacionesEmpleado from '../../components/empleado/CapacitacionesEmpleado';
import EventosProximos from '../../components/EventosProximos';

const EmpleadoDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    cursosAsignados: 0,
    cursosCompletados: 0,
    certificadosObtenidos: 0,
    evaluacionesAprobadas: 0,
    progresoGeneral: 0
  });
  const [cursosRecientes, setCursosRecientes] = useState([]);
  const [capacitacionesProximas, setCapacitacionesProximas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Exponer setActiveTab globalmente para el navbar
  useEffect(() => {
    window.setEmpleadoTab = setActiveTab;
    return () => {
      delete window.setEmpleadoTab;
    };
  }, []);

  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/empleado/dashboard');
      const data = response.data;
      setStats({
        cursosAsignados: data.cursosAsignados,
        cursosCompletados: data.cursosCompletados,
        certificadosObtenidos: data.certificadosObtenidos,
        evaluacionesAprobadas: data.evaluacionesAprobadas,
        progresoGeneral: data.progresoGeneral
      });
      setCursosRecientes(data.cursosRecientes || []);
      setCapacitacionesProximas(data.capacitacionesProximas || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-dark-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{value}</p>
          {subtitle && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const CourseCard = ({ course, onContinue }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">{course.name}</h3>
          <p className="text-gray-600 text-sm mt-1">{course.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          course.status === 'Completado' 
            ? 'bg-green-100 text-green-800' 
            : course.status === 'En Progreso'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {course.status}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progreso</span>
          <span>{course.progress}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              course.status === 'Completado' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span>{course.completedModules}/{course.totalModules} módulos</span>
        </div>
        <button
          onClick={() => onContinue(course)}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            course.status === 'Completado'
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {course.status === 'Completado' ? (
            <>
              <Award className="h-4 w-4" />
              Ver Certificado
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Continuar
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const misCursos = [
    {
      id: 1,
      name: 'Seguridad Industrial',
      description: 'Fundamentos de seguridad en el trabajo',
      progress: 85,
      status: 'En Progreso',
      completedModules: 4,
      totalModules: 5
    },
    {
      id: 2,
      name: 'Primeros Auxilios',
      description: 'Técnicas básicas de primeros auxilios',
      progress: 100,
      status: 'Completado',
      completedModules: 6,
      totalModules: 6
    },
    {
      id: 3,
      name: 'Liderazgo Empresarial',
      description: 'Desarrollo de habilidades de liderazgo',
      progress: 45,
      status: 'En Progreso',
      completedModules: 2,
      totalModules: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'cursos' ? (
          <MisCursosEmpleado />
        ) : activeTab === 'eventos' ? (
          <EventosEmpleado />
        ) : activeTab === 'certificados' ? (
          <MisCertificadosEmpleado />

        ) : activeTab === 'capacitaciones' ? (
          <CapacitacionesEmpleado />
        ) : activeTab === 'eventos' ? (
          <div>
            <div className="mb-6">
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-dark-600">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Eventos y Capacitaciones
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Próximas capacitaciones y eventos disponibles</p>
                  </div>
                </div>
              </div>
            </div>
            <EventosProximos />
          </div>
        ) : (
        <>
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Patrón de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 right-20 w-20 h-20 bg-white opacity-10 rounded-full"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white/80 font-medium">TRANSYT</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  ¡Hola, {nombre}!
                </h1>
                <p className="text-blue-100">Continúa desarrollando tus habilidades profesionales</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('cursos')}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 border border-white/20"
                >
                  <BookOpen className="h-5 w-5" />
                  Mis Cursos
                </button>
                <button 
                  onClick={() => setActiveTab('certificados')}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 font-medium"
                >
                  <Award className="h-5 w-5" />
                  Certificados
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Cursos Asignados"
            value={stats.cursosAsignados}
            color="bg-blue-500"
            subtitle="Total asignados"
          />
          <StatCard
            icon={CheckCircle}
            title="Completados"
            value={stats.cursosCompletados}
            color="bg-green-500"
            subtitle="Finalizados"
          />
          <StatCard
            icon={Award}
            title="Certificados"
            value={stats.certificadosObtenidos}
            color="bg-purple-500"
            subtitle="Obtenidos"
          />
          <StatCard
            icon={TrendingUp}
            title="Evaluaciones"
            value={stats.evaluacionesAprobadas}
            color="bg-orange-500"
            subtitle="Aprobadas"
          />
          <StatCard
            icon={Clock}
            title="Progreso"
            value={`${stats.progresoGeneral}%`}
            color="bg-indigo-500"
            subtitle="General"
          />
        </div>

        {/* Mis Cursos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Mis Cursos</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Ver todos
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursosRecientes.length > 0 ? cursosRecientes.map((curso) => (
              <div key={curso.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{curso.titulo}</h3>
                    <p className="text-gray-600 text-sm mt-1">{curso.descripcion}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    curso.completado 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {curso.completado ? 'Completado' : 'En Progreso'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span>Asignado: {new Date(curso.fechaAsignacion).toLocaleDateString('es-ES')}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('cursos')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Ver Curso
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tienes cursos asignados</p>
              </div>
            )}
          </div>
        </div>

        {/* Eventos Próximos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Próximos Eventos</h2>
            <button 
              onClick={() => setActiveTab('eventos')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Ver todos
            </button>
          </div>
          <EventosProximos />
        </div>

        {/* Capacitaciones Próximas */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-dark-600">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Capacitaciones Próximas</h2>
          <div className="space-y-4">
            {capacitacionesProximas.length > 0 ? capacitacionesProximas.map((capacitacion, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Video className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{capacitacion.titulo}</p>
                    <p className="text-gray-500 text-sm">{capacitacion.curso}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm">
                    {new Date(capacitacion.fechaInicio).toLocaleDateString('es-ES')}
                  </span>
                  <button 
                    onClick={() => window.open(capacitacion.enlaceTeams, '_blank')}
                    className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    Unirse
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay capacitaciones próximas</p>
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default EmpleadoDashboard;