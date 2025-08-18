import React, { useState, useEffect } from 'react';
import { X, Play, FileText, Image, Download, ChevronRight, ChevronDown, BookOpen, ClipboardList } from 'lucide-react';
import { usuariosAdminService } from '../../services/dashboardService';

const CursoPreview = ({ curso, onClose }) => {
  const [modulos, setModulos] = useState([]);
  const [tests, setTests] = useState([]);
  const [moduloActivo, setModuloActivo] = useState(null);
  const [submoduloActivo, setSubmoduloActivo] = useState(null);
  const [testActivo, setTestActivo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (curso?.id) {
      loadModulos();
    }
  }, [curso]);

  const loadModulos = async () => {
    try {
      const modulosData = await usuariosAdminService.getModulos(curso.id);
      setModulos(modulosData || []);
      
      // Cargar tests del curso
      try {
        const response = await fetch(`http://localhost:8080/api/evaluaciones/curso/${curso.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const testsData = await response.json();
          console.log('Tests cargados en preview:', testsData);
          setTests(testsData || []);
        }
      } catch (error) {
        console.log('No hay tests para este curso');
        setTests([]);
      }
      
      // Seleccionar primer módulo y submódulo por defecto
      if (modulosData && modulosData.length > 0) {
        setModuloActivo(modulosData[0]);
        if (modulosData[0].submodulos && modulosData[0].submodulos.length > 0) {
          setSubmoduloActivo(modulosData[0].submodulos[0]);
        }
      }
    } catch (error) {
      console.error('Error loading módulos:', error);
      setModulos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModuloClick = (modulo) => {
    setModuloActivo(modulo);
    if (modulo.submodulos && modulo.submodulos.length > 0) {
      setSubmoduloActivo(modulo.submodulos[0]);
    } else {
      setSubmoduloActivo(null);
    }
  };

  const handleSubmoduloClick = (submodulo) => {
    setSubmoduloActivo(submodulo);
    setTestActivo(null);
  };

  const handleTestClick = (test) => {
    setTestActivo(test);
    setSubmoduloActivo(null);
  };

  const getIconForTipo = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'imagen':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderContenido = () => {
    if (testActivo) {
      return (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="h-6 w-6 text-orange-600" />
              <h3 className="text-xl font-semibold text-orange-800">{testActivo.titulo}</h3>
            </div>
            
            {testActivo.descripcion && (
              <p className="text-gray-700 mb-4">{testActivo.descripcion}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-gray-600">Puntuación mínima:</span>
                <span className="ml-2 font-semibold text-orange-600">{testActivo.notaMinima}%</span>
              </div>
              <div className="bg-white p-3 rounded border">
                <span className="font-medium text-gray-600">Preguntas:</span>
                <span className="ml-2 font-semibold text-orange-600">{testActivo.preguntas?.length || 0}</span>
              </div>
            </div>
          </div>
          
          {testActivo.preguntas && testActivo.preguntas.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Preguntas del Test:</h4>
              {testActivo.preguntas.map((pregunta, index) => (
                <div key={pregunta.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{pregunta.enunciado}</p>
                      <span className="text-xs text-gray-500">Puntaje: {pregunta.puntaje} puntos</span>
                    </div>
                  </div>
                  
                  {pregunta.tipo === 'multiple' && pregunta.respuestas && (
                    <div className="ml-8 space-y-2">
                      {pregunta.respuestas.map((respuesta, respIndex) => (
                        <div key={respuesta.id} className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name={`pregunta-${pregunta.id}`}
                            className="text-blue-600"
                            disabled
                          />
                          <span className="text-gray-700">{respuesta.texto}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {pregunta.tipo === 'texto' && (
                    <div className="ml-8">
                      <textarea
                        placeholder="Escribe tu respuesta aquí..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                        disabled
                      />
                      {pregunta.respuestaEsperada && (
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>Respuesta esperada:</strong> {pregunta.respuestaEsperada}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">Este test aún no tiene preguntas configuradas.</p>
            </div>
          )}
        </div>
      );
    }
    
    if (!submoduloActivo) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Selecciona un tema o test para ver su contenido</p>
          </div>
        </div>
      );
    }

    const { tipo, contenido, archivo } = submoduloActivo;

    switch (tipo?.toLowerCase()) {
      case 'video':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{submoduloActivo.titulo}</h3>
            {archivo?.url ? (
              <video 
                controls 
                className="w-full max-h-96 bg-black rounded-lg"
                src={archivo.url}
              >
                Tu navegador no soporta el elemento video.
              </video>
            ) : contenido ? (
              contenido.includes('youtube.com') || contenido.includes('youtu.be') ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={contenido.replace('watch?v=', 'embed/')}
                    title={submoduloActivo.titulo}
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video 
                  controls 
                  className="w-full max-h-96 bg-black rounded-lg"
                  src={contenido}
                >
                  Tu navegador no soporta el elemento video.
                </video>
              )
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800">No hay contenido de video disponible</p>
              </div>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{submoduloActivo.titulo}</h3>
            {archivo?.url ? (
              <div className="space-y-4">
                <iframe
                  src={`${archivo.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-[600px] border rounded-lg"
                  title={submoduloActivo.titulo}
                  type="application/pdf"
                />
                <a 
                  href={archivo.downloadUrl || archivo.url}
                  download={archivo.name}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-fit"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </a>
              </div>
            ) : contenido ? (
              <div className="space-y-4">
                <iframe
                  src={`${contenido}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-[600px] border rounded-lg"
                  title={submoduloActivo.titulo}
                  type="application/pdf"
                />
                <a 
                  href={contenido}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-fit"
                >
                  <Download className="h-4 w-4" />
                  Ver PDF completo
                </a>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800">No hay archivo PDF disponible</p>
              </div>
            )}
          </div>
        );

      case 'imagen':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{submoduloActivo.titulo}</h3>
            {archivo?.url ? (
              <div className="flex justify-center">
                <img 
                  src={archivo.url}
                  alt={submoduloActivo.titulo}
                  className="max-w-full max-h-96 h-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg" style={{ display: 'none' }}>
                  <p className="text-red-800">Error al cargar la imagen</p>
                </div>
              </div>
            ) : contenido ? (
              <div className="flex justify-center">
                <img 
                  src={contenido} 
                  alt={submoduloActivo.titulo}
                  className="max-w-full max-h-96 h-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg" style={{ display: 'none' }}>
                  <p className="text-red-800">Error al cargar la imagen</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800">No hay imagen disponible</p>
              </div>
            )}
          </div>
        );

      case 'texto':
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{submoduloActivo.titulo}</h3>
            <div className="bg-white p-6 rounded-lg border">
              <div className="prose max-w-none">
                {contenido ? (
                  <p className="whitespace-pre-wrap">{contenido}</p>
                ) : (
                  <p className="text-gray-500 italic">No hay contenido de texto disponible</p>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4">Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex">
        
        {/* Sidebar - Lista de módulos */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">{curso.titulo}</h2>
            <p className="text-sm text-gray-600 mt-1">Vista previa del curso</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {/* Tests generales */}
            {tests.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Tests del Curso</h4>
                {tests.map((test) => (
                  <button
                    key={test.id}
                    onClick={() => handleTestClick(test)}
                    className={`w-full p-3 mb-2 text-left flex items-center gap-3 rounded-lg border transition-colors ${
                      testActivo?.id === test.id
                        ? 'bg-orange-100 text-orange-800 border-orange-200'
                        : 'hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span className="font-medium">{test.titulo}</span>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full ml-auto">
                      Test
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {modulos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay módulos disponibles</p>
              </div>
            ) : (
              <div className="space-y-2">
                {modulos.map((modulo, index) => (
                  <div key={modulo.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => handleModuloClick(modulo)}
                      className={`w-full p-3 text-left flex items-center justify-between rounded-lg transition-colors ${
                        moduloActivo?.id === modulo.id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 w-6">
                          {index + 1}
                        </span>
                        <span className="font-medium">{modulo.titulo}</span>
                      </div>
                      {moduloActivo?.id === modulo.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {moduloActivo?.id === modulo.id && (
                      <div className="px-3 pb-3">
                        {modulo.submodulos && modulo.submodulos.map((submodulo, subIndex) => (
                          <button
                            key={submodulo.id}
                            onClick={() => handleSubmoduloClick(submodulo)}
                            className={`w-full p-2 text-left flex items-center gap-3 rounded transition-colors ${
                              submoduloActivo?.id === submodulo.id
                                ? 'bg-blue-100 text-blue-800'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-xs text-gray-500 w-8">
                              {index + 1}.{subIndex + 1}
                            </span>
                            {getIconForTipo(submodulo.tipo)}
                            <span className="text-sm">{submodulo.titulo}</span>
                          </button>
                        ))}
                        
                        {/* Tests del módulo */}
                        {tests.filter(test => test.moduloId === modulo.id || (!test.moduloId && tests.length > 0)).map((test) => (
                          <button
                            key={test.id}
                            onClick={() => handleTestClick(test)}
                            className={`w-full p-2 text-left flex items-center gap-3 rounded transition-colors ${
                              testActivo?.id === test.id
                                ? 'bg-orange-100 text-orange-800'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <ClipboardList className="h-4 w-4" />
                            <span className="text-sm font-medium">{test.titulo}</span>
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full ml-auto">
                              Test
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold">
                {testActivo ? testActivo.titulo : submoduloActivo ? submoduloActivo.titulo : 'Contenido del curso'}
              </h3>
              <p className="text-sm text-gray-600">
                Vista como empleado
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {renderContenido()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursoPreview;