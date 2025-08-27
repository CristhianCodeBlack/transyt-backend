import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Settings, 
  Bell, 
  Menu, 
  X,
  BookOpen,
  Users,
  Award,
  BarChart3,
  Home,
  ClipboardList,
  Video,
  Calendar,
  FileText
} from "lucide-react";
import { authService } from "../services/api";
import api from "../services/api";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";
import NotificationCenter from "./NotificationCenter";
import OfflineManager from "./OfflineManager";
import ThemeToggle from "./ThemeToggle";


const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [cursos, setCursos] = useState([]);
  
  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Cargar cursos para el gestor offline
  useEffect(() => {
    const loadCursos = async () => {
      try {
        const response = await api.get('/cursos');
        setCursos(response.data);
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    
    if (localStorage.getItem('token')) {
      loadCursos();
    }
  }, []);

  const handleLogout = () => {
    try {
      authService.logout();
      toast.success("Sesión cerrada exitosamente");
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/");
    }
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const getNavItems = () => {
    switch (rol) {
      case "ADMIN":
        return [
          { path: "/admin", icon: Home, label: "Dashboard", tab: 'dashboard' },
          { path: "/admin", icon: BookOpen, label: "Cursos", tab: 'cursos' },
          { path: "/admin", icon: Users, label: "Usuarios", tab: 'usuarios' },
          { path: "/admin", icon: ClipboardList, label: "Seguimiento", tab: 'seguimiento-tests' },
          { path: "/admin", icon: Video, label: "Capacitaciones", tab: 'capacitaciones-vivo' },
          { path: "/admin", icon: Calendar, label: "Calendario", tab: 'calendario' },
          { path: "/admin", icon: Award, label: "Certificados", tab: 'certificados' },
          { path: "/admin", icon: BarChart3, label: "Reportes", tab: 'reportes' },
          { path: "/admin", icon: Settings, label: "Config", tab: 'configuracion' }
        ];
      case "INSTRUCTOR":
        return [
          { path: "/instructor", icon: Home, label: "Dashboard", tab: 'dashboard' },
          { path: "/instructor", icon: BookOpen, label: "Cursos", tab: 'cursos' },
          { path: "/instructor", icon: Users, label: "Usuarios", tab: 'usuarios' },
          { path: "/instructor", icon: ClipboardList, label: "Seguimiento", tab: 'seguimiento-tests' },
          { path: "/instructor", icon: Video, label: "Capacitaciones", tab: 'capacitaciones-vivo' },
          { path: "/instructor", icon: Calendar, label: "Calendario", tab: 'calendario' },
          { path: "/instructor", icon: Award, label: "Certificados", tab: 'certificados' },
          { path: "/instructor", icon: BarChart3, label: "Reportes", tab: 'reportes' }
        ];
      case "EMPLEADO":
        return [
          { path: "/empleado", icon: Home, label: "Dashboard", tab: 'dashboard' },
          { path: "/empleado", icon: BookOpen, label: "Mis Cursos", tab: 'cursos' },
          { path: "/empleado", icon: Calendar, label: "Eventos", tab: 'eventos' },
          { path: "/empleado", icon: Video, label: "Capacitaciones", tab: 'capacitaciones' },
          { path: "/empleado", icon: Award, label: "Certificados", tab: 'certificados' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 dark:from-dark-800 dark:via-dark-700 dark:to-dark-800 shadow-2xl border-b border-blue-700 dark:border-dark-600 sticky top-0 z-50 transition-colors duration-200 w-full navbar-container">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo y marca */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  TRANSYT
                </span>
                <p className="text-xs text-blue-200 -mt-1">Plataforma de Capacitación</p>
              </div>
            </div>

            {/* Navigation Links - Desktop (solo primeros 4) */}
            <div className="hidden lg:flex items-center space-x-1 ml-4">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return item.tab ? (
                  <button
                    key={item.tab}
                    onClick={() => {
                      if (window.setAdminTab) {
                        window.setAdminTab(item.tab);
                      }
                      if (window.setInstructorTab) {
                        window.setInstructorTab(item.tab);
                      }
                      if (window.setEmpleadoTab) {
                        window.setEmpleadoTab(item.tab);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:text-white hover:bg-white/10`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-blue-100 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Menú hamburguesa para más opciones */}
              {navItems.length > 4 && (
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:text-white hover:bg-white/10"
                >
                  <Menu className="h-4 w-4" />
                  Más
                </button>
              )}
            </div>
          </div>

          {/* Right side - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Offline Manager */}
            <OfflineManager cursos={cursos} data-offline-toggle />
            
            {/* Notification Center */}
            <div data-notification-toggle>
              <NotificationCenter />
            </div>

            {/* User Menu */}
            <div className="relative ml-1">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white">{nombre}</p>
                  <p className="text-xs text-blue-200 capitalize">{rol?.toLowerCase()}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>


            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-blue-700 dark:border-dark-600 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-dark-800 dark:to-dark-800">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return item.tab ? (
                  <button
                    key={item.tab}
                    onClick={() => {
                      if (window.setAdminTab) {
                        window.setAdminTab(item.tab);
                      }
                      if (window.setInstructorTab) {
                        window.setInstructorTab(item.tab);
                      }
                      if (window.setEmpleadoTab) {
                        window.setEmpleadoTab(item.tab);
                      }
                      setShowMobileMenu(false);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-blue-100 hover:text-white hover:bg-white/10`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-white/20 text-white"
                        : "text-blue-100 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            {/* Opciones adicionales en móvil */}
            <div className="border-t border-blue-700 mt-4 pt-4 space-y-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-blue-100">Modo Oscuro</span>
                <ThemeToggle />
              </div>
              
              <div className="px-3 py-2">
                <div className="text-sm text-blue-100 mb-2">Descargas Offline</div>
                <OfflineManager cursos={cursos} />
              </div>
              
              <div className="px-3 py-2">
                <div className="text-sm text-blue-100 mb-2">Notificaciones</div>
                <NotificationCenter />
              </div>
            </div>
            
            <div className="border-t border-blue-700 mt-4 pt-4">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{nombre}</p>
                  <p className="text-xs text-blue-200 capitalize">{rol?.toLowerCase()}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/20 flex items-center gap-3 mt-2 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de opciones adicionales */}
      {showMobileMenu && navItems.length > 4 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Más Opciones</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {navItems.slice(4).map((item) => {
                  const Icon = item.icon;
                  return item.tab ? (
                    <button
                      key={item.tab}
                      onClick={() => {
                        if (window.setAdminTab) {
                          window.setAdminTab(item.tab);
                        }
                        if (window.setInstructorTab) {
                          window.setInstructorTab(item.tab);
                        }
                        if (window.setEmpleadoTab) {
                          window.setEmpleadoTab(item.tab);
                        }
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de usuario */}
      {showUserMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{nombre}</h3>
                    <p className="text-sm text-orange-100 capitalize">{rol?.toLowerCase()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Contenido */}
            <div className="p-6 space-y-3">
              <button className="w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg flex items-center gap-3 transition-colors">
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </button>
              
              <button
                onClick={() => {
                  handleLogout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-3 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;