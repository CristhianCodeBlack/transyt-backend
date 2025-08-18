import React, { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle, Clock, Plus, Eye, ClipboardList, Video, Award, BarChart3, Home, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CursosList from '../../components/cursos/CursosList';
import UsuariosList from '../../components/usuarios/UsuariosList';
import CertificadosAdmin from '../../components/certificados/CertificadosAdmin';
import ReportesAdmin from '../../components/reportes/ReportesAdmin';
import SeguimientoTests from '../../components/seguimiento/SeguimientoTests';
import CapacitacionesVivo from '../../components/capacitaciones/CapacitacionesVivo';
import EventCalendar from '../../components/EventCalendar';
import EventosManager from '../../components/EventosManager';


import { dashboardService } from '../../services/dashboardService';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    misCursos: 0,
    estudiantesActivos: 0,
    modulosCreados: 0,
    evaluacionesPendientes: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [misCursos, setMisCursos] = useState([]);
  
  // Exponer setActiveTab globalmente para el navbar
  useEffect(() => {
    window.setInstructorTab = setActiveTab;
    return () => {
      delete window.setInstructorTab;
    };
  }, []);

  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [instructorStats, cursosData] = await Promise.all([
        fetch('http://localhost:8080/api/instructor-stats/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json()),
        fetch('http://localhost:8080/api/cursos', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json())
      ]);
      
      setStats({
        misCursos: instructorStats.totalCursos,
        estudiantesActivos: instructorStats.totalUsuarios,
        modulosCreados: instructorStats.certificadosEmitidos,
        evaluacionesPendientes: instructorStats.recentActivity.length
      });
      setRecentActivity(instructorStats.recentActivity);
      setMisCursos(cursosData.slice(0, 3));
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-dark-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-full -mr-10 -mt-10 opacity-50"></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mt-2">{value}</p>
          {subtitle && (
            <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 mt-4 font-medium">Cargando panel TRANSYT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'cursos' ? (
          <CursosList />
        ) : activeTab === 'usuarios' ? (
          <UsuariosList isInstructor={true} />
        ) : activeTab === 'certificados' ? (
          <CertificadosAdmin />
        ) : activeTab === 'reportes' ? (
          <ReportesAdmin />
        ) : activeTab === 'seguimiento-tests' ? (
          <SeguimientoTests />
        ) : activeTab === 'capacitaciones-vivo' ? (
          <CapacitacionesVivo />
        ) : activeTab === 'calendario' ? (
          <div>
            <div className="mb-6">
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-dark-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                        Calendario de Eventos - Instructor
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Gestiona y programa capacitaciones y eventos</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('eventos-manager')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-colors text-sm"
                  >
                    Gestionar Eventos
                  </button>
                </div>
              </div>
            </div>
            <EventCalendar />
          </div>
        ) : activeTab === 'eventos-manager' ? (
          <EventosManager />

        ) : (
        <div>
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-dark-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">T</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    Panel de Instructor TRANSYT
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">¡Hola, {nombre}! Gestiona tus cursos y estudiantes.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('cursos')}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Gestionar Cursos
                </button>
                <button 
                  onClick={() => setActiveTab('seguimiento-tests')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Eye className="h-5 w-5" />
                  Ver Seguimiento
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={BookOpen}
            title="Mis Cursos"
            value={stats.misCursos}
            color="bg-gradient-to-br from-emerald-500 to-green-600"
            subtitle="Cursos asignados"
          />
          <StatCard
            icon={Users}
            title="Estudiantes Activos"
            value={stats.estudiantesActivos}
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
            subtitle="En mis cursos"
          />
          <StatCard
            icon={CheckCircle}
            title="Módulos Creados"
            value={stats.modulosCreados}
            color="bg-gradient-to-br from-purple-500 to-indigo-600"
            subtitle="Total de contenido"
          />
          <StatCard
            icon={Clock}
            title="Evaluaciones Pendientes"
            value={stats.evaluacionesPendientes}
            color="bg-gradient-to-br from-orange-500 to-red-500"
            subtitle="Por revisar"
          />
        </div>

        {/* Mis Cursos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-dark-600">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">Mis Cursos</h2>
            <div className="space-y-4">
              {misCursos.map((course, index) => (
                <div key={index} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800 dark:text-white">{course.titulo}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                    <span>{course.usuariosInscritos || 0} estudiantes</span>
                    <span>Creado: {new Date(course.fechaCreacion).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="mt-2 bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.activo ? '100' : '0'}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{course.descripcion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-dark-600">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">Actividad Reciente</h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-dark-600 last:border-b-0">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-white text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                      <span className="text-green-600 dark:text-green-400 font-medium">{activity.course}</span>
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No hay actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;