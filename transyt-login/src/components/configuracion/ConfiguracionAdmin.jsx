import React, { useState, useEffect } from 'react';
import { Settings, Save, Building, Mail, Globe, Shield, Upload, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { authService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ConfiguracionAdmin = () => {
  const [activeTab, setActiveTab] = useState('empresa');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    empresa: {
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      sitioWeb: ''
    },
    sistema: {
      nombrePlataforma: '',
      emailNotificaciones: '',
      tiempoSesion: 60,
      tamañoMaxArchivo: 50
    },
    certificados: {
      plantilla: 'moderna',
      incluirLogo: true,
      colorPrimario: '#3B82F6',
      colorSecundario: '#1E40AF'
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await api.get('/admin/configuracion');
      setConfig(response.data);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  const handleSave = async (section) => {
    setLoading(true);
    try {
      await api.put(`/admin/configuracion/${section}`, config[section]);
      toast.success(`Configuración de ${section} guardada exitosamente`);
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/');
  };

  const handleChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: Building },
    { id: 'sistema', label: 'Sistema', icon: Settings },
    { id: 'certificados', label: 'Certificados', icon: Shield },
    { id: 'sesion', label: 'Sesión', icon: LogOut }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600">Administra la configuración del sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Empresa Tab */}
      {activeTab === 'empresa' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Información de la Empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la empresa
              </label>
              <input
                type="text"
                value={config.empresa?.nombre || ''}
                onChange={(e) => handleChange('empresa', 'nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="text"
                value={config.empresa?.telefono || ''}
                onChange={(e) => handleChange('empresa', 'telefono', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={config.empresa?.direccion || ''}
                onChange={(e) => handleChange('empresa', 'direccion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={config.empresa?.email || ''}
                onChange={(e) => handleChange('empresa', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sitio web
              </label>
              <input
                type="text"
                value={config.empresa?.sitioWeb || ''}
                onChange={(e) => handleChange('empresa', 'sitioWeb', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => handleSave('empresa')}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Sistema Tab */}
      {activeTab === 'sistema' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Configuración del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la plataforma
              </label>
              <input
                type="text"
                value={config.sistema?.nombrePlataforma || ''}
                onChange={(e) => handleChange('sistema', 'nombrePlataforma', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email para notificaciones
              </label>
              <input
                type="email"
                value={config.sistema?.emailNotificaciones || ''}
                onChange={(e) => handleChange('sistema', 'emailNotificaciones', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de sesión (minutos)
              </label>
              <input
                type="number"
                value={config.sistema?.tiempoSesion || 60}
                onChange={(e) => handleChange('sistema', 'tiempoSesion', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño máximo de archivo (MB)
              </label>
              <input
                type="number"
                value={config.sistema?.tamañoMaxArchivo || 50}
                onChange={(e) => handleChange('sistema', 'tamañoMaxArchivo', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => handleSave('sistema')}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Certificados Tab */}
      {activeTab === 'certificados' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Configuración de Certificados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plantilla
              </label>
              <select
                value={config.certificados?.plantilla || 'moderna'}
                onChange={(e) => handleChange('certificados', 'plantilla', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="moderna">Moderna</option>
                <option value="clasica">Clásica</option>
                <option value="elegante">Elegante</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color primario
              </label>
              <input
                type="color"
                value={config.certificados?.colorPrimario || '#3B82F6'}
                onChange={(e) => handleChange('certificados', 'colorPrimario', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.certificados?.incluirLogo || false}
                  onChange={(e) => handleChange('certificados', 'incluirLogo', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Incluir logo de la empresa</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => handleSave('certificados')}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Sesión Tab */}
      {activeTab === 'sesion' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Gestión de Sesión</h2>
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-medium text-yellow-800">Cerrar Sesión</h3>
                  <p className="text-yellow-700 text-sm">Cierra tu sesión actual y regresa a la página de inicio</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionAdmin;