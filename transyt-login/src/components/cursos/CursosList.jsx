import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, BookOpen, Search, Eye } from 'lucide-react';
import { cursoService } from '../../services/cursoService';
import toast from 'react-hot-toast';
import CursoModal from './CursoModal';
import CursoPreview from './CursoPreview';

const CursosList = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCurso, setPreviewCurso] = useState(null);

  useEffect(() => {
    loadCursos();
  }, []);

  const loadCursos = async () => {
    try {
      const data = await cursoService.listarCursosDTO();
      setCursos(data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      toast.error('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este curso?')) {
      try {
        await cursoService.eliminarCurso(id);
        toast.success('Curso eliminado exitosamente');
        loadCursos();
      } catch (error) {
        toast.error('Error al eliminar curso');
      }
    }
  };

  const handleEdit = (curso) => {
    setSelectedCurso(curso);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedCurso(null);
    setShowModal(true);
  };

  const handlePreview = (curso) => {
    setPreviewCurso(curso);
    setShowPreview(true);
  };

  const handleModalClose = (shouldReload = true) => {
    setShowModal(false);
    setSelectedCurso(null);
    if (shouldReload) {
      setTimeout(() => {
        loadCursos();
      }, 100);
    }
  };

  const filteredCursos = cursos.filter(curso =>
    curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Cargando cursos TRANSYT...</p>
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
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Gestión de Cursos TRANSYT</h1>
              <p className="text-gray-600 mt-1">Administra y crea contenido educativo para tu organización</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar cursos en TRANSYT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-lg hover:shadow-xl bg-white"
        />
      </div>

      {/* Cursos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCursos.map((curso) => (
          <div key={curso.id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">{curso.titulo}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{curso.descripcion}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                curso.activo 
                  ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800' 
                  : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
              }`}>
                {curso.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4 relative z-10">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{curso.totalModulos || 0} módulos</span>
                </span>
                <span className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-lg">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium">{curso.totalEstudiantes || 0} estudiantes</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">
                Creado: {curso.fechaCreacion}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePreview(curso)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                  title="Vista previa del curso"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(curso)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                  title="Editar curso"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(curso.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                  title="Eliminar curso"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCursos.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay cursos disponibles</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchTerm ? 'No se encontraron cursos con ese término de búsqueda' : 'Comienza creando tu primer curso en TRANSYT'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Crear Primer Curso
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CursoModal
          curso={selectedCurso}
          onClose={handleModalClose}
        />
      )}
      
      {/* Vista Previa */}
      {showPreview && (
        <CursoPreview
          curso={previewCurso}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CursosList;