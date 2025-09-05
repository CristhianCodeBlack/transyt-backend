import React, { useState, useEffect } from 'react';
import { X, Save, Upload, FileText, Video, File } from 'lucide-react';
import { moduloService } from '../../services/moduloService';
import toast from 'react-hot-toast';

const ModuloModal = ({ modulo, cursoId, onClose }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'TEXTO',
    orden: 1,
    contenido: '',
    cursoId: cursoId
  });
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (modulo) {
      setFormData({
        titulo: modulo.titulo || '',
        tipo: modulo.tipo || 'TEXTO',
        orden: modulo.orden || 1,
        contenido: modulo.contenido || '',
        cursoId: cursoId
      });
    }
  }, [modulo, cursoId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (formData.tipo === 'TEXTO' && !formData.contenido.trim()) {
      newErrors.contenido = 'El contenido es obligatorio para módulos de texto';
    }

    if ((formData.tipo === 'VIDEO' || formData.tipo === 'PDF') && !archivo && !modulo) {
      newErrors.archivo = 'El archivo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (formData.tipo === 'TEXTO') {
        // Crear módulo de texto
        await moduloService.crearModuloTexto(formData);
        toast.success('Módulo de texto creado exitosamente');
      } else {
        // Crear módulo con archivo usando progreso
        const formDataToSend = new FormData();
        formDataToSend.append('titulo', formData.titulo);
        formDataToSend.append('tipo', formData.tipo);
        formDataToSend.append('orden', formData.orden);
        formDataToSend.append('cursoId', cursoId);
        if (archivo) {
          formDataToSend.append('archivo', archivo);
        }

        await moduloService.crearModuloConArchivoConProgreso(
          formDataToSend, 
          (progress, status) => {
            setUploadProgress(progress);
            setUploadStatus(status);
          }
        );
        toast.success(`Módulo con ${formData.tipo.toLowerCase()} creado exitosamente`);
      }
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          'Error al guardar el módulo';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = {
        VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
        PDF: ['application/pdf']
      };

      if (validTypes[formData.tipo] && !validTypes[formData.tipo].includes(file.type)) {
        toast.error(`Tipo de archivo no válido para ${formData.tipo}`);
        return;
      }

      // Validar tamaño (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('El archivo no puede ser mayor a 50MB');
        return;
      }

      setArchivo(file);
      if (errors.archivo) {
        setErrors(prev => ({ ...prev, archivo: '' }));
      }
    }
  };

  const getFileIcon = () => {
    switch (formData.tipo) {
      case 'VIDEO':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'PDF':
        return <File className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-green-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <h2 className="text-xl font-semibold text-gray-800">
              {modulo ? 'Editar Módulo' : 'Nuevo Módulo'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del módulo *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.titulo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Introducción a la seguridad"
            />
            {errors.titulo && (
              <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de módulo *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={modulo} // No permitir cambiar tipo en edición
            >
              <option value="TEXTO">Texto</option>
              <option value="VIDEO">Video</option>
              <option value="PDF">PDF</option>
            </select>
          </div>

          {/* Orden */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orden *
            </label>
            <input
              type="number"
              name="orden"
              value={formData.orden}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Contenido para TEXTO */}
          {formData.tipo === 'TEXTO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido *
              </label>
              <textarea
                name="contenido"
                value={formData.contenido}
                onChange={handleChange}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.contenido ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Escribe el contenido del módulo..."
              />
              {errors.contenido && (
                <p className="text-red-500 text-sm mt-1">{errors.contenido}</p>
              )}
            </div>
          )}

          {/* Archivo para VIDEO/PDF */}
          {(formData.tipo === 'VIDEO' || formData.tipo === 'PDF') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo {formData.tipo} *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept={formData.tipo === 'VIDEO' ? 'video/*' : 'application/pdf'}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label htmlFor="file-upload" className={`cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {archivo ? archivo.name : `Seleccionar archivo ${formData.tipo}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 50MB
                  </p>
                </label>
              </div>
              
              {/* Barra de progreso */}
              {loading && uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{uploadStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {errors.archivo && (
                <p className="text-red-500 text-sm mt-1">{errors.archivo}</p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {modulo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuloModal;