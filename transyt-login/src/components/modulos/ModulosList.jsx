import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Video, File, Eye, Download } from 'lucide-react';
import { moduloService } from '../../services/moduloService';
import toast from 'react-hot-toast';
import ModuloModal from './ModuloModal';

const ModulosList = ({ cursoId, cursoTitulo }) => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedModulo, setSelectedModulo] = useState(null);

  useEffect(() => {
    if (cursoId) {
      loadModulos();
    }
  }, [cursoId]);

  const loadModulos = async () => {
    try {
      const data = await moduloService.listarModulosPorCurso(cursoId);
      setModulos(data);
    } catch (error) {
      toast.error('Error al cargar módulos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este módulo?')) {
      try {
        await moduloService.eliminarModulo(id);
        toast.success('Módulo eliminado exitosamente');
        loadModulos();
      } catch (error) {
        toast.error('Error al eliminar módulo');
      }
    }
  };

  const handleEdit = (modulo) => {
    setSelectedModulo(modulo);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedModulo(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedModulo(null);
    loadModulos();
  };

  const handlePreview = async (modulo) => {
    if (modulo.tipo === 'TEXTO') {
      // Mostrar contenido de texto en modal
      alert(modulo.contenido);
      return;
    }

    try {
      const blob = await moduloService.previsualizarArchivo(modulo.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Error al previsualizar archivo');
    }
  };

  const handleDownload = async (modulo) => {
    try {
      const blob = await moduloService.descargarArchivo(modulo.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = modulo.nombreArchivo || `modulo-${modulo.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error al descargar archivo');
    }
  };

  const getModuleIcon = (tipo) => {
    switch (tipo) {
      case 'VIDEO':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'PDF':
        return <File className="h-5 w-5 text-blue-500" />;
      case 'TEXTO':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Módulos del Curso</h2>
          <p className="text-gray-600">{cursoTitulo}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Módulo
        </button>
      </div>

      {/* Módulos List */}
      <div className="space-y-4">
        {modulos.map((modulo) => (
          <div key={modulo.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {getModuleIcon(modulo.tipo)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{modulo.titulo}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Orden {modulo.orden}
                    </span>
                  </div>
                  
                  {modulo.tipo === 'TEXTO' ? (
                    <p className="text-gray-600 text-sm line-clamp-2">{modulo.contenido}</p>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p>Archivo: {modulo.nombreArchivo}</p>
                      <p>Tipo: {modulo.tipo} • Tamaño: {(modulo.tamanioArchivo / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {modulo.tipo !== 'TEXTO' && modulo.tienePreview && (
                  <button
                    onClick={() => handlePreview(modulo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Vista previa"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                
                {modulo.tipo !== 'TEXTO' && (
                  <button
                    onClick={() => handleDownload(modulo)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => handleEdit(modulo)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar módulo"
                >
                  <Edit className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(modulo.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar módulo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modulos.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay módulos</h3>
          <p className="text-gray-500 mb-4">Comienza creando el primer módulo de este curso</p>
          <button
            onClick={handleCreate}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Módulo
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ModuloModal
          modulo={selectedModulo}
          cursoId={cursoId}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default ModulosList;