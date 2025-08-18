import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, UserCheck, BookOpen, Filter } from 'lucide-react';
import { usuariosAdminService } from '../../services/dashboardService';
import toast from 'react-hot-toast';
import UsuarioModal from './UsuarioModal';
import AsignarCursosModal from './AsignarCursosModal';

const UsuariosList = ({ isInstructor = false }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const data = await usuariosAdminService.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await usuariosAdminService.deleteUsuario(id);
        toast.success('Usuario eliminado exitosamente');
        loadUsuarios();
      } catch (error) {
        toast.error('Error al eliminar usuario');
      }
    }
  };

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedUsuario(null);
    setShowModal(true);
  };

  const handleAsignarCursos = (usuario) => {
    setSelectedUsuario(usuario);
    setShowAsignarModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUsuario(null);
    loadUsuarios();
  };

  const handleAsignarModalClose = () => {
    setShowAsignarModal(false);
    setSelectedUsuario(null);
    loadUsuarios();
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.correo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRol = filterRol === '' || usuario.rol === filterRol;
    return matchesSearch && matchesRol;
  });

  const getRolColor = (rol) => {
    switch (rol) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'INSTRUCTOR':
        return 'bg-blue-100 text-blue-800';
      case 'EMPLEADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Cargando usuarios TRANSYT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Gestión de Usuarios TRANSYT</h1>
              <p className="text-gray-600 mt-1">Administra y gestiona el equipo de tu organización</p>
            </div>
          </div>
          {!isInstructor && (
            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Nuevo Usuario
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar usuarios en TRANSYT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Filtrar:</span>
          </div>
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 bg-white"
          >
            <option value="">Todos los roles</option>
            <option value="ADMIN">Administrador</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="EMPLEADO">Empleado</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Usuarios</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-1">{usuarios.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Activos</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mt-1">
                {usuarios.filter(u => u.activo).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Instructores</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                {usuarios.filter(u => u.rol === 'INSTRUCTOR').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Empleados</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mt-1">
                {usuarios.filter(u => u.rol === 'EMPLEADO').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cursos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{usuario.nombre}</div>
                      <div className="text-sm text-gray-600 font-medium">{usuario.correo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getRolColor(usuario.rol)}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                      usuario.activo 
                        ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800' 
                        : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-sm font-medium">
                      {usuario.cursosAsignados} cursos
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                    {usuario.fechaCreacion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleAsignarCursos(usuario)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                        title="Asignar cursos"
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                      {!isInstructor && (
                        <>
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                            title="Editar usuario"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(usuario.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <UserCheck className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay usuarios disponibles</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchTerm || filterRol 
              ? 'No se encontraron usuarios con los filtros aplicados en TRANSYT' 
              : 'Comienza agregando el primer usuario a tu organización'
            }
          </p>
          {!searchTerm && !filterRol && !isInstructor && (
            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Crear Primer Usuario
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <UsuarioModal
          usuario={selectedUsuario}
          onClose={handleModalClose}
        />
      )}

      {showAsignarModal && (
        <AsignarCursosModal
          usuario={selectedUsuario}
          onClose={handleAsignarModalClose}
        />
      )}
    </div>
  );
};

export default UsuariosList;