import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Users, BookOpen, FileText, User, Upload, ClipboardList } from 'lucide-react';
import { cursoService } from '../../services/cursoService';
import { usuariosAdminService } from '../../services/dashboardService';
import toast from 'react-hot-toast';
import TestQuestionsModal from './TestQuestionsModal';

const CursoModal = ({ curso, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    empresaId: 1
  });
  const [modulos, setModulos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [usuariosAsignados, setUsuariosAsignados] = useState([]);
  const [instructorAsignado, setInstructorAsignado] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [tests, setTests] = useState([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUsuarios();
    loadEmpresas();
    
    if (curso) {
      setFormData({
        titulo: curso.titulo || '',
        descripcion: curso.descripcion || '',
        empresaId: curso.empresaId || 1
      });
      loadCursoData();
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        empresaId: 1
      });
      setModulos([]);
      setUsuariosAsignados([]);
      setInstructorAsignado(null);
      setTests([]);
    }
  }, [curso]);

  const loadCursoData = async () => {
    if (!curso?.id) return;
    
    try {
      // Cargar módulos del curso
      try {
        const modulosData = await usuariosAdminService.getModulos(curso.id);
        console.log('Módulos cargados:', modulosData);
        setModulos(modulosData || []);
      } catch (error) {
        console.log('No hay módulos para este curso');
        setModulos([]);
      }
      
      // Cargar usuarios asignados al curso
      try {
        const response = await fetch(`/api/cursos/${curso.id}/usuarios`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const usuariosData = await response.json();
          setUsuariosAsignados(usuariosData || []);
        }
      } catch (error) {
        console.log('No hay usuarios asignados a este curso');
        setUsuariosAsignados([]);
      }
      
      // Cargar instructor asignado
      try {
        const response = await fetch(`/api/cursos/${curso.id}/instructor`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const instructorData = await response.json();
          setInstructorAsignado(instructorData);
        }
      } catch (error) {
        console.log('No hay instructor asignado a este curso');
        setInstructorAsignado(null);
      }
      
      // Cargar tests del curso SOLO si no hay tests locales
      if (tests.length === 0) {
        try {
          const response = await fetch(`/api/evaluaciones/curso/${curso.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const testsData = await response.json();
            console.log('Tests cargados del servidor:', testsData);
            setTests(testsData || []);
          }
        } catch (error) {
          console.log('No hay tests para este curso');
          setTests([]);
        }
      }
    } catch (error) {
      console.error('Error loading curso data:', error);
      setModulos([]);
      setUsuariosAsignados([]);
      setInstructorAsignado(null);
    }
  };

  const loadUsuarios = async () => {
    try {
      const data = await usuariosAdminService.getUsuarios();
      setUsuarios(data.filter(u => u.rol === 'EMPLEADO'));
      setInstructores(data.filter(u => u.rol === 'INSTRUCTOR'));
    } catch (error) {
      console.error('Error loading usuarios:', error);
    }
  };

  const loadEmpresas = async () => {
    try {
      const response = await fetch('/api/empresas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEmpresas(data);
      }
    } catch (error) {
      console.error('Error loading empresas:', error);
      // Si no se pueden cargar empresas, usar empresa por defecto
      setEmpresas([{ id: 1, nombre: 'Empresa Demo' }]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = 'El título debe tener al menos 3 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.empresaId) {
      newErrors.empresaId = 'Debe seleccionar una empresa';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('formData:', formData);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    setLoading(true);
    try {
      let cursoId;
      
      // Preparar datos para enviar
      const dataToSend = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        empresaId: formData.empresaId
      };
      
      if (curso) {
        console.log('Updating curso:', curso.id, 'with data:', dataToSend);
        const cursoActualizado = await cursoService.actualizarCurso(curso.id, dataToSend);
        console.log('Curso actualizado:', cursoActualizado);
        cursoId = curso.id;
        toast.success('Curso actualizado exitosamente');
      } else {
        console.log('Creating new curso with data:', dataToSend);
        const nuevoCurso = await cursoService.crearCurso(dataToSend);
        console.log('New curso created:', nuevoCurso);
        cursoId = nuevoCurso.id;
        toast.success('Curso creado exitosamente');
      }
      
      // Guardar módulos si existen
      if (modulos.length > 0) {
        const modulosToSave = modulos.map((modulo, index) => ({
          titulo: modulo.titulo,
          orden: index + 1,
          submodulos: modulo.submodulos || []
        }));
        
        await usuariosAdminService.saveModulos(cursoId, modulosToSave);
      }
      
      // Asignar instructor si está seleccionado
      if (instructorAsignado) {
        await usuariosAdminService.asignarInstructor(cursoId, instructorAsignado.id);
      }
      
      // Asignar usuarios
      for (const usuario of usuariosAsignados) {
        try {
          await usuariosAdminService.asignarCurso(usuario.id, cursoId);
        } catch (error) {
          console.log('Usuario ya asignado:', usuario.nombre);
        }
      }
      
      // Procesar tests: crear nuevos y actualizar existentes
      for (const test of tests) {
        if (!test.titulo?.trim()) continue;
        
        try {
          // Filtrar preguntas válidas
          const preguntasValidas = (test.preguntas || []).filter(p => 
            p.enunciado && p.enunciado.trim().length >= 10
          ).map(p => ({
            ...p,
            tipo: p.tipo || 'multiple',
            respuestaEsperada: p.respuestaEsperada || null
          }));
          
          const esTestNuevo = test.isNew && (!test.id || typeof test.id === 'number');
          const esTestExistente = (!test.isNew && test.id && typeof test.id !== 'number') || test.hasChanges;
          
          console.log(`Test "${test.titulo}": isNew=${test.isNew}, id=${test.id}, hasChanges=${test.hasChanges}, esNuevo=${esTestNuevo}, esExistente=${esTestExistente}`);
          
          if (esTestNuevo) {
            // CREAR NUEVO TEST
            const testCompleto = {
              titulo: test.titulo,
              descripcion: test.descripcion || '',
              notaMinima: test.notaMinima || 70,
              cursoId: cursoId,
              moduloId: test.moduloId || null,
              preguntas: preguntasValidas
            };
            
            console.log('CREANDO test nuevo:', testCompleto);
            
            const response = await fetch('http://localhost:8080/api/evaluaciones/simple', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(testCompleto)
            });
            
            if (response.ok) {
              const responseText = await response.text();
              console.log('Test nuevo creado:', responseText);
              
              // Marcar el test como no-nuevo para evitar duplicación
              test.isNew = false;
              // Extraer ID del response si es posible
              const match = responseText.match(/ID: (\d+)/);
              if (match) {
                test.id = parseInt(match[1]);
              }
            } else {
              const errorText = await response.text();
              console.error('Error creando test:', errorText);
            }
            
          } else if (esTestExistente) {
            // ACTUALIZAR TEST EXISTENTE (solo preguntas)
            const updateData = {
              id: test.id,
              preguntas: preguntasValidas
            };
            
            console.log('ACTUALIZANDO preguntas del test:', updateData);
            
            const response = await fetch('http://localhost:8080/api/evaluaciones/actualizar-preguntas', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updateData)
            });
            
            if (response.ok) {
              const responseText = await response.text();
              console.log('Preguntas actualizadas:', responseText);
              
              // Limpiar bandera de cambios
              test.hasChanges = false;
            } else {
              const errorText = await response.text();
              console.error('Error actualizando preguntas:', errorText);
            }
          }
          
        } catch (error) {
          console.error('Error:', error);
        }
      }
      
      // Cerrar el modal después de guardar exitosamente
      onClose();
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Error al guardar el curso';
      
      if (error.response) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'empresaId' ? parseInt(value) || null : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addModulo = () => {
    const nuevoModulo = {
      id: Date.now(),
      titulo: '',
      orden: modulos.length + 1,
      submodulos: [],
      isNew: true
    };
    setModulos([...modulos, nuevoModulo]);
  };

  const addSubmodulo = (moduloId) => {
    const nuevoSubmodulo = {
      id: Date.now(),
      titulo: '',
      tipo: 'video',
      contenido: '',
      orden: 1
    };
    
    setModulos(modulos.map(m => 
      m.id === moduloId 
        ? { ...m, submodulos: [...(m.submodulos || []), nuevoSubmodulo] }
        : m
    ));
  };

  const removeSubmodulo = (moduloId, submoduloId) => {
    setModulos(modulos.map(m => 
      m.id === moduloId 
        ? { ...m, submodulos: m.submodulos.filter(s => s.id !== submoduloId) }
        : m
    ));
  };

  const updateSubmodulo = (moduloId, submoduloId, field, value) => {
    setModulos(modulos.map(m => 
      m.id === moduloId 
        ? {
            ...m, 
            submodulos: m.submodulos.map(s => 
              s.id === submoduloId ? { ...s, [field]: value } : s
            )
          }
        : m
    ));
  };

  const handleFileUpload = async (moduloId, submoduloId, file) => {
    if (!file) return;
    
    // Validar tamaño del archivo (500MB máximo)
    if (file.size > 500 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 500MB.');
      return;
    }
    
    try {
      // Subir archivo al backend
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Error al subir archivo');
      }
      
      const result = await response.json();
      
      // Guardar la información del archivo en el submódulo
      updateSubmodulo(moduloId, submoduloId, 'archivo', {
        name: result.originalName,
        filename: result.filename,
        url: result.url,
        size: result.size,
        contentType: result.contentType
      });
      updateSubmodulo(moduloId, submoduloId, 'contenido', result.url);
      
      toast.success(`Archivo ${file.name} subido exitosamente`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error al subir el archivo');
    }
  };

  const removeModulo = (id) => {
    setModulos(modulos.filter(m => m.id !== id));
  };

  const updateModulo = (id, field, value) => {
    setModulos(modulos.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const asignarUsuario = (usuario) => {
    if (!usuariosAsignados.find(u => u.id === usuario.id)) {
      setUsuariosAsignados([...usuariosAsignados, usuario]);
    }
  };

  const desasignarUsuario = (usuarioId) => {
    setUsuariosAsignados(usuariosAsignados.filter(u => u.id !== usuarioId));
  };

  const addTest = () => {
    const nuevoTest = {
      id: Date.now(),
      titulo: '',
      descripcion: '',
      notaMinima: 70,
      preguntas: [],
      isNew: true
    };
    setTests([...tests, nuevoTest]);
  };

  const updateTest = (index, field, value) => {
    setTests(tests.map((test, i) => 
      i === index ? { ...test, [field]: value } : test
    ));
  };

  const removeTest = async (index) => {
    const test = tests[index];
    console.log('Eliminando test:', test);
    
    // Si el test tiene ID del servidor, eliminarlo del backend
    if (test.id && !test.isNew) {
      try {
        console.log('Eliminando del servidor test ID:', test.id);
        const response = await fetch(`http://localhost:8080/api/evaluaciones/${test.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          console.log('Test eliminado del servidor exitosamente');
          toast.success('Test eliminado exitosamente');
        } else {
          const errorText = await response.text();
          console.error('Error eliminando test del servidor:', errorText);
          toast.error('Error al eliminar test del servidor');
          return; // No eliminar del frontend si falló en el backend
        }
      } catch (error) {
        console.error('Error eliminando test:', error);
        toast.error('Error al eliminar test');
        return;
      }
    } else {
      console.log('Test local eliminado (no estaba en servidor)');
      toast.success('Test eliminado');
    }
    
    // Eliminar del frontend
    setTests(prevTests => {
      const newTests = prevTests.filter((_, i) => i !== index);
      console.log('Tests después de eliminar:', newTests.length);
      return newTests;
    });
  };

  const editTestQuestions = (index) => {
    setSelectedTest({ ...tests[index], index });
    setShowQuestionsModal(true);
  };

  const handleSaveQuestions = (updatedTest) => {
    const { index, ...testData } = updatedTest;
    console.log('Actualizando test con preguntas:', testData);
    
    setTests(prevTests => {
      const newTests = [...prevTests];
      const currentTest = newTests[index];
      
      // Marcar como modificado si es un test existente
      const hasChanges = JSON.stringify(currentTest.preguntas || []) !== JSON.stringify(testData.preguntas || []);
      
      newTests[index] = {
        ...currentTest,
        preguntas: testData.preguntas || [],
        hasChanges: hasChanges && !currentTest.isNew // Solo marcar cambios si no es nuevo
      };
      
      console.log(`Test ${index} actualizado - ID: ${currentTest.id}, hasChanges: ${hasChanges}`);
      return newTests;
    });
    
    setShowQuestionsModal(false);
    setSelectedTest(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {curso ? 'Editar Curso' : 'Nuevo Curso'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Información
          </button>
          <button
            onClick={() => setActiveTab('modulos')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'modulos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Módulos
          </button>
          <button
            onClick={() => setActiveTab('instructor')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'instructor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Instructor
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'usuarios'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Estudiantes
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ClipboardList className="h-4 w-4 inline mr-2" />
            Tests
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {activeTab === 'info' && (
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del curso *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.titulo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Seguridad Industrial"
                  maxLength={200}
                />
                {errors.titulo && (
                  <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.descripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe el contenido y objetivos del curso..."
                  maxLength={2000}
                />
                {errors.descripcion && (
                  <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa *
                </label>
                <select
                  name="empresaId"
                  value={formData.empresaId || ''}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.empresaId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar empresa</option>
                  {empresas.map(empresa => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
                {errors.empresaId && (
                  <p className="text-red-500 text-sm mt-1">{errors.empresaId}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'modulos' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Módulos del Curso</h3>
                <button
                  onClick={addModulo}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Módulo
                </button>
              </div>
              
              <div className="space-y-4">
                {modulos.map((modulo, index) => (
                  <div key={modulo.id} className="border border-gray-200 rounded-lg">
                    {/* Módulo Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-500 w-8">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={modulo.titulo}
                          onChange={(e) => updateModulo(modulo.id, 'titulo', e.target.value)}
                          placeholder="Título del módulo (ej: Introducción)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                        <button
                          onClick={() => addSubmodulo(modulo.id)}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Subtema
                        </button>
                        <button
                          onClick={() => removeModulo(modulo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Submódulos */}
                    <div className="p-4">
                      {modulo.submodulos && modulo.submodulos.length > 0 ? (
                        <div className="space-y-3">
                          {modulo.submodulos.map((submodulo, subIndex) => (
                            <div key={submodulo.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                <span className="text-xs text-gray-500 mt-2 w-12">
                                  {index + 1}.{subIndex + 1}
                                </span>
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={submodulo.titulo}
                                    onChange={(e) => updateSubmodulo(modulo.id, submodulo.id, 'titulo', e.target.value)}
                                    placeholder="Título del subtema (ej: Quiénes somos)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                  <div className="space-y-2">
                                    <div className="flex gap-2">
                                      <select
                                        value={submodulo.tipo}
                                        onChange={(e) => updateSubmodulo(modulo.id, submodulo.id, 'tipo', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                      >
                                        <option value="video">Video</option>
                                        <option value="pdf">PDF</option>
                                        <option value="texto">Texto</option>
                                        <option value="imagen">Imagen</option>
                                      </select>
                                      {submodulo.tipo === 'texto' ? (
                                        <textarea
                                          value={submodulo.contenido || ''}
                                          onChange={(e) => updateSubmodulo(modulo.id, submodulo.id, 'contenido', e.target.value)}
                                          placeholder="Escribe el contenido del texto..."
                                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                          rows={2}
                                        />
                                      ) : (
                                        <input
                                          type="file"
                                          accept={submodulo.tipo === 'video' ? 'video/*' : submodulo.tipo === 'pdf' ? '.pdf' : 'image/*'}
                                          onChange={(e) => handleFileUpload(modulo.id, submodulo.id, e.target.files[0])}
                                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                      )}
                                    </div>
                                    {submodulo.archivo && (
                                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                        ✓ Archivo: {submodulo.archivo.name}
                                      </div>
                                    )}
                                    {submodulo.contenido && submodulo.tipo !== 'texto' && (
                                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        URL: {submodulo.contenido}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeSubmodulo(modulo.id, submodulo.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          <p>No hay subtemas. Haz clic en "Subtema" para agregar contenido.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {modulos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay módulos agregados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'instructor' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Asignar Instructor</h3>
              
              {instructorAsignado ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">{instructorAsignado.nombre}</p>
                      <p className="text-sm text-green-600">{instructorAsignado.correo}</p>
                    </div>
                    <button
                      onClick={() => setInstructorAsignado(null)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 text-sm">No hay instructor asignado a este curso</p>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Instructores Disponibles:</h4>
                {instructores.filter(i => !instructorAsignado || i.id !== instructorAsignado.id).map(instructor => (
                  <div key={instructor.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-medium">{instructor.nombre}</p>
                      <p className="text-sm text-gray-600">{instructor.correo}</p>
                    </div>
                    <button
                      onClick={() => setInstructorAsignado(instructor)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      Asignar
                    </button>
                  </div>
                ))}
                
                {instructores.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay instructores disponibles</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Usuarios Asignados</h3>
                  <div className="space-y-2">
                    {usuariosAsignados.map(usuario => (
                      <div key={usuario.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <p className="font-medium">{usuario.nombre}</p>
                          <p className="text-sm text-gray-600">{usuario.correo}</p>
                        </div>
                        <button
                          onClick={() => desasignarUsuario(usuario.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Usuarios Disponibles</h3>
                  <div className="space-y-2">
                    {usuarios.filter(u => !usuariosAsignados.find(ua => ua.id === u.id)).map(usuario => (
                      <div key={usuario.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <p className="font-medium">{usuario.nombre}</p>
                          <p className="text-sm text-gray-600">{usuario.correo}</p>
                        </div>
                        <button
                          onClick={() => asignarUsuario(usuario)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tests del Curso</h3>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (curso?.id) {
                        try {
                          const response = await fetch(`/api/evaluaciones/curso/${curso.id}`, {
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                          });
                          if (response.ok) {
                            const testsData = await response.json();
                            setTests(testsData || []);
                            toast.success('Tests recargados');
                          }
                        } catch (error) {
                          toast.error('Error recargando tests');
                        }
                      }
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Recargar
                  </button>
                  <button
                    onClick={addTest}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Test
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {tests.map((test, index) => (
                  <div key={test.id || index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título del Test
                        </label>
                        <input
                          type="text"
                          value={test.titulo || ''}
                          onChange={(e) => updateTest(index, 'titulo', e.target.value)}
                          placeholder="Ej: Examen Final"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Módulo
                        </label>
                        <select
                          value={test.moduloId || ''}
                          onChange={(e) => updateTest(index, 'moduloId', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar módulo</option>
                          {modulos.map(modulo => (
                            <option key={modulo.id} value={modulo.id}>
                              {modulo.titulo}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Puntuación Mínima (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={test.notaMinima || 70}
                          onChange={(e) => updateTest(index, 'notaMinima', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={test.descripcion || ''}
                        onChange={(e) => updateTest(index, 'descripcion', e.target.value)}
                        placeholder="Descripción del test..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {test.preguntas?.length || 0} preguntas
                        </span>
                        {test.hasChanges && (
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                            Sin guardar
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editTestQuestions(index)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                        >
                          Editar Preguntas
                        </button>
                        <button
                          onClick={() => removeTest(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {tests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay tests agregados</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {curso ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
      
      {/* Modal de Preguntas */}
      {showQuestionsModal && (
        <TestQuestionsModal
          test={selectedTest}
          onClose={() => {
            setShowQuestionsModal(false);
            setSelectedTest(null);
          }}
          onSave={handleSaveQuestions}
        />
      )}
    </div>
  );
};

export default CursoModal;