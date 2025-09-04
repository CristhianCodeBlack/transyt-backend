import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, TrendingUp, Plus, Settings, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CursosList from '../../components/cursos/CursosList';
import UsuariosList from '../../components/usuarios/UsuariosList';
import CertificadosAdmin from '../../components/certificados/CertificadosAdmin';
import ReportesAdmin from '../../components/reportes/ReportesAdmin';
import ConfiguracionAdmin from '../../components/configuracion/ConfiguracionAdmin';
import SeguimientoTests from '../../components/seguimiento/SeguimientoTests';
import CapacitacionesVivo from '../../components/capacitaciones/CapacitacionesVivo';
import { dashboardService, usuariosAdminService } from '../../services/dashboardService';
import EventCalendar from '../../components/EventCalendar';
import EventosProximos from '../../components/EventosProximos';
import EventosManager from '../../components/EventosManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Exponer setActiveTab globalmente para el navbar
  useEffect(() => {
    window.setAdminTab = setActiveTab;
    return () => {
      delete window.setAdminTab;
    };
  }, []);
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalCursos: 0,
    certificadosEmitidos: 0,
    progresoPromedio: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const nombre = localStorage.getItem('nombre');

  useEffect(() => {
    // Solo cargar datos si estamos en el dashboard principal
    if (activeTab === 'dashboard') {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      // Cargar stats primero (más rápido)
      setLoading(false); // Mostrar UI inmediatamente
      
      const statsData = await dashboardService.getAdminStats();
      setStats(statsData);
      
      // Cargar actividad después (menos crítico)
      setTimeout(async () => {
        try {
          const activityData = await dashboardService.getRecentActivity();
          setRecentActivity(activityData);
        } catch (error) {
          console.log('Error cargando actividad:', error);
        }
      }, 100);
      
    } catch (error) {
      console.log('Error cargando stats:', error);
      // No mostrar toast para no molestar al usuario
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 dark:border-dark-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-dark-700 dark:to-dark-600 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10 opacity-50"></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="min-w-0 flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-1 sm:mt-2">{value}</p>
          {trend && (
            <p className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm mt-1 sm:mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              +{trend}% este mes
            </p>
          )}
        </div>
        <div className={`p-3 sm:p-4 rounded-2xl ${color} shadow-lg flex-shrink-0`}>
          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, title, description, onClick, color }) => (
    <button
      onClick={onClick}
      className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 dark:border-dark-600 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left w-full group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dark-700 dark:to-dark-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="flex items-center gap-3 sm:gap-4 relative z-10">
        <div className={`p-3 sm:p-4 rounded-2xl ${color} shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">{description}</p>
        </div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Cargando panel TRANSYT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'cursos' ? (
          <CursosList />
        ) : activeTab === 'usuarios' ? (
          <UsuariosList />
        ) : activeTab === 'certificados' ? (
          <CertificadosAdmin />
        ) : activeTab === 'reportes' ? (
          <ReportesAdmin />
        ) : activeTab === 'configuracion' ? (
          <ConfiguracionAdmin />
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
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Calendario de Eventos TRANSYT
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
        <div className="mb-6 lg:mb-8">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-dark-600">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-2xl">T</span>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Panel de Administración TRANSYT
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">Bienvenido, {nombre}. Gestiona tu plataforma de capacitación.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <StatCard
            icon={Users}
            title="Total Usuarios"
            value={stats.totalUsuarios}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend={12}
          />
          <StatCard
            icon={BookOpen}
            title="Cursos Activos"
            value={stats.totalCursos}
            color="bg-gradient-to-br from-emerald-500 to-green-600"
            trend={8}
          />
          <StatCard
            icon={Award}
            title="Certificados Emitidos"
            value={stats.certificadosEmitidos}
            color="bg-gradient-to-br from-purple-500 to-indigo-600"
            trend={15}
          />
          <StatCard
            icon={TrendingUp}
            title="Progreso Promedio"
            value={`${stats.progresoPromedio}%`}
            color="bg-gradient-to-br from-orange-500 to-red-500"
            trend={5}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 sm:mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              icon={Plus}
              title="Crear Nuevo Curso"
              description="Agrega un nuevo curso a la plataforma"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              onClick={() => setActiveTab('cursos')}
            />
            <QuickAction
              icon={Users}
              title="Gestionar Usuarios"
              description="Administra usuarios y permisos"
              color="bg-gradient-to-br from-emerald-500 to-green-600"
              onClick={() => setActiveTab('usuarios')}
            />
            <QuickAction
              icon={Award}
              title="Ver Certificados"
              description="Revisa certificados emitidos"
              color="bg-gradient-to-br from-purple-500 to-indigo-600"
              onClick={() => setActiveTab('certificados')}
            />
          </div>
        </div>

        {/* Eventos Próximos y Actividad Reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          <EventosProximos />
          
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-dark-600">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Actividad Reciente</h2>
          <div className="space-y-2">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100 dark:border-dark-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-lg px-3 sm:px-4 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-800 dark:text-white font-medium text-sm sm:text-base">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{activity.user}</span> {activity.action}{' '}
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{activity.course}</span>
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">{activity.time}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark-600 dark:to-dark-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No hay actividad reciente</p>
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

export default AdminDashboard;