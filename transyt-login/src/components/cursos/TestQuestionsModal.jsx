import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const TestQuestionsModal = ({ test, onClose, onSave }) => {
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (test?.preguntas) {
      setPreguntas(test.preguntas);
    } else {
      setPreguntas([]);
    }
  }, [test]);

  const addPregunta = () => {
    const nuevaPregunta = {
      id: Date.now(),
      enunciado: '',
      puntaje: 1,
      tipo: 'multiple', // 'multiple' o 'texto'
      respuestas: [
        { id: Date.now() + 1, texto: '', esCorrecta: true },
        { id: Date.now() + 2, texto: '', esCorrecta: false }
      ],
      isNew: true
    };
    setPreguntas([...preguntas, nuevaPregunta]);
  };

  const updatePregunta = (index, field, value) => {
    setPreguntas(preguntas.map((pregunta, i) => 
      i === index ? { ...pregunta, [field]: value } : pregunta
    ));
  };

  const removePregunta = (index) => {
    setPreguntas(preguntas.filter((_, i) => i !== index));
  };

  const addRespuesta = (preguntaIndex) => {
    const nuevaRespuesta = {
      id: Date.now(),
      texto: '',
      esCorrecta: false
    };
    
    setPreguntas(preguntas.map((pregunta, i) => 
      i === preguntaIndex 
        ? { ...pregunta, respuestas: [...pregunta.respuestas, nuevaRespuesta] }
        : pregunta
    ));
  };

  const updateRespuesta = (preguntaIndex, respuestaIndex, field, value) => {
    setPreguntas(preguntas.map((pregunta, i) => 
      i === preguntaIndex 
        ? {
            ...pregunta,
            respuestas: pregunta.respuestas.map((respuesta, j) => 
              j === respuestaIndex ? { ...respuesta, [field]: value } : respuesta
            )
          }
        : pregunta
    ));
  };

  const removeRespuesta = (preguntaIndex, respuestaIndex) => {
    setPreguntas(preguntas.map((pregunta, i) => 
      i === preguntaIndex 
        ? {
            ...pregunta,
            respuestas: pregunta.respuestas.filter((_, j) => j !== respuestaIndex)
          }
        : pregunta
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validar preguntas según su tipo
      for (const pregunta of preguntas) {
        if (!pregunta.enunciado.trim()) {
          toast.error('Todas las preguntas deben tener un enunciado');
          return;
        }
        
        if (pregunta.tipo === 'multiple') {
          if (pregunta.respuestas.length < 2) {
            toast.error('Las preguntas de opción múltiple deben tener al menos 2 opciones');
            return;
          }
          
          const respuestasCorrectas = pregunta.respuestas.filter(r => r.esCorrecta);
          if (respuestasCorrectas.length === 0) {
            toast.error('Las preguntas de opción múltiple deben tener al menos una respuesta correcta');
            return;
          }
          
          for (const respuesta of pregunta.respuestas) {
            if (!respuesta.texto.trim()) {
              toast.error('Todas las opciones deben tener texto');
              return;
            }
          }
        }
        // Las preguntas de texto no necesitan validación adicional
      }

      onSave({ ...test, preguntas });
      toast.success('Preguntas guardadas exitosamente');
      onClose();
    } catch (error) {
      toast.error('Error al guardar preguntas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Editar Preguntas: {test?.titulo}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {preguntas.length} pregunta{preguntas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {preguntas.map((pregunta, preguntaIndex) => (
              <div key={pregunta.id || preguntaIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Pregunta {preguntaIndex + 1}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Tipo:</label>
                      <select
                        value={pregunta.tipo || 'multiple'}
                        onChange={(e) => updatePregunta(preguntaIndex, 'tipo', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="multiple">Opción múltiple</option>
                        <option value="texto">Respuesta escrita</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Puntaje:</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={pregunta.puntaje || 1}
                        onChange={(e) => updatePregunta(preguntaIndex, 'puntaje', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removePregunta(preguntaIndex)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enunciado de la pregunta
                  </label>
                  <textarea
                    value={pregunta.enunciado || ''}
                    onChange={(e) => updatePregunta(preguntaIndex, 'enunciado', e.target.value)}
                    placeholder="Escribe la pregunta aquí..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {pregunta.tipo === 'multiple' ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Opciones de respuesta
                      </label>
                      <button
                        onClick={() => addRespuesta(preguntaIndex)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Agregar
                      </button>
                    </div>

                    <div className="space-y-2">
                      {pregunta.respuestas?.map((respuesta, respuestaIndex) => (
                        <div key={respuesta.id || respuestaIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={respuesta.esCorrecta || false}
                            onChange={(e) => updateRespuesta(preguntaIndex, respuestaIndex, 'esCorrecta', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={respuesta.texto || ''}
                            onChange={(e) => updateRespuesta(preguntaIndex, respuestaIndex, 'texto', e.target.value)}
                            placeholder="Texto de la opción..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => removeRespuesta(preguntaIndex, respuestaIndex)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            disabled={pregunta.respuestas.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Respuesta esperada (opcional - para referencia del instructor)
                    </label>
                    <textarea
                      value={pregunta.respuestaEsperada || ''}
                      onChange={(e) => updatePregunta(preguntaIndex, 'respuestaEsperada', e.target.value)}
                      placeholder="Describe la respuesta esperada para ayudar en la calificación manual..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Las preguntas de texto requieren calificación manual por el instructor
                    </p>
                  </div>
                )}
              </div>
            ))}

            {preguntas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay preguntas agregadas</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={addPregunta}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Pregunta
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar Preguntas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuestionsModal;