import React, { useState, useEffect } from 'react';
import { Award, Download, Eye, Search, Filter, Calendar, User, XCircle } from 'lucide-react';
import { certificadosAdminService } from '../../services/certificadoService';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CertificadosAdmin = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurso, setFilterCurso] = useState('');

  useEffect(() => {
    loadCertificados();
  }, []);

  const loadCertificados = async () => {
    try {
      // Debug de autenticación
      const authDebug = await certificadosAdminService.debugAuth();
      console.log('Debug auth:', authDebug);
      
      if (!authDebug.authenticated) {
        toast.error('No estás autenticado');
        return;
      }
      
      if (!authDebug.isAdmin) {
        toast.error('No tienes permisos de administrador');
        return;
      }
      
      const data = await certificadosAdminService.getCertificados();
      setCertificados(data);
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response?.status === 403) {
        toast.error('No tienes permisos para ver los certificados');
      } else if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
      } else {
        toast.error('Error al cargar certificados: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async (certificadoId) => {
    try {
      const response = await api.get(`/certificados/${certificadoId}/descargar`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${certificadoId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Certificado descargado');
    } catch (error) {
      toast.error('Error al descargar certificado');
    }
  };

  const handleRevocar = async (certificadoId) => {
    if (window.confirm('¿Estás seguro de revocar este certificado?')) {
      try {
        await certificadosAdminService.revocarCertificado(certificadoId);
        loadCertificados();
        toast.success('Certificado revocado');
      } catch (error) {
        toast.error('Error al revocar certificado');
      }
    }
  };

  const filteredCertificados = certificados.filter(cert => {
    const matchesSearch = (cert.nombreUsuario?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (cert.codigoVerificacion?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCurso = filterCurso === '' || cert.nombreCurso === filterCurso;
    return matchesSearch && matchesCurso;
  });

  const cursosUnicos = [...new Set(certificados.map(cert => cert.nombreCurso).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Cargando certificados TRANSYT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Certificados TRANSYT</h1>
            <p className="text-gray-600 mt-1">Gestiona y supervisa todos los certificados emitidos</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Certificados</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">{certificados.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-green-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Certificados Activos</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mt-2">
                {certificados.filter(c => c.activo).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-50 to-pink-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Certificados Revocados</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mt-2">
                {certificados.filter(c => !c.activo).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar certificados en TRANSYT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-xl">
            <Filter className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Curso:</span>
          </div>
          <select
            value={filterCurso}
            onChange={(e) => setFilterCurso(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300 bg-white"
          >
            <option value="">Todos los cursos</option>
            {cursosUnicos.map(curso => (
              <option key={curso} value={curso}>{curso}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-purple-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Curso</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCertificados.map((cert) => (
              <tr key={cert.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{cert.nombreUsuario || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{cert.nombreCurso || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-lg text-xs font-mono font-bold">
                    {cert.codigoVerificacion || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-600">{cert.fechaGeneracion || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                    cert.activo 
                      ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800' 
                      : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                  }`}>
                    {cert.activo ? 'Activo' : 'Revocado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleDescargar(cert.id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {cert.activo && (
                      <button
                        onClick={() => handleRevocar(cert.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                        title="Revocar"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificadosAdmin;