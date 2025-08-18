import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { evaluacionService } from '../../services/evaluacionService';
import toast from 'react-hot-toast';

const EvaluacionModal = ({ evaluacion, cursoId, onClose }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    notaMinima: 70,
    cursoId: cursoId
  });
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Datos básicos, 2: Preguntas

  useEffect(() => {
    if (evaluacion) {
      setFormData({
        titulo: evaluacion.titulo || '',
        descripcion: evaluacion.descripcion || '',
        notaMinima: evaluacion.notaMinima || 70,
        cursoId: cursoId
      });
      setPreguntas(evaluacion.preguntas || []);
    }
  }, [evaluacion, cursoId]);

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }

    if (formData.notaMinima < 1 || formData.notaMinima > 100) {
      newErrors.notaMinima = 'La nota mínima debe estar entre 1 y 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (preguntas.length === 0) {
      toast.error('Debe agregar al menos una pregunta');
      return false;
    }

    for (let i = 0; i < preguntas.length; i++) {
      const pregunta = preguntas[i];
      if (!pregunta.enunciado.trim()) {
        toast.error(`La pregunta ${i + 1} debe tener un enunciado`);
        return false;
      }
      if (pregunta.respuestas.length < 2) {
        toast.error(`La pregunta ${i + 1} debe tener al menos 2 respuestas`);
        return false;
      }
      const correctas = pregunta.respuestas.filter(r => r.esCorrecta);
      if (correctas.length !== 1) {
        toast.error(`La pregunta ${i + 1} debe tener exactamente una respuesta correcta`);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Crear evaluación
      const evaluacionCreada = await evaluacionService.crearEvaluacion(formData);
      
      // Agregar preguntas
      for (const pregunta of preguntas) {
        await evaluacionService.agregarPregunta(evaluacionCreada.id, pregunta);
      }

      toast.success('Evaluación creada exitosamente');
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          'Error al crear la evaluación';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'notaMinima' ? parseInt(value) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const agregarPregunta = () => {
    setPreguntas(prev => [...prev, {
      enunciado: '',
      puntaje: 10,
      respuestas: [
        { texto: '', esCorrecta: true },
        { texto: '', esCorrecta: false }
      ]
    }]);
  };

  const eliminarPregunta = (index) => {
    setPreguntas(prev => prev.filter((_, i) => i !== index));
  };

  const actualizarPregunta = (index, field, value) => {
    setPreguntas(prev => prev.map((pregunta, i) => 
      i === index ? { ...pregunta, [field]: value } : pregunta
    ));
  };

  const agregarRespuesta = (preguntaIndex) => {
    setPreguntas(prev => prev.map((pregunta, i) => 
      i === preguntaIndex 
        ? { ...pregunta, respuestas: [...pregunta.respuestas, { texto: '', esCorrecta: false }] }
        : pregunta
    ));
  };

  const eliminarRespuesta = (preguntaIndex, respuestaIndex) => {
    setPreguntas(prev => prev.map((pregunta, i) => 
      i === preguntaIndex 
        ? { ...pregunta, respuestas: pregunta.respuestas.filter((_, j) => j !== respuestaIndex) }
        : pregunta
    ));
  };

  const actualizarRespuesta = (preguntaIndex, respuestaIndex, field, value) => {
    setPreguntas(prev => prev.map((pregunta, i) => 
      i === preguntaIndex 
        ? {
            ...pregunta,
            respuestas: pregunta.respuestas.map((respuesta, j) => 
              j === respuestaIndex 
                ? { ...respuesta, [field]: field === 'esCorrecta' ? value : value }
                : field === 'esCorrecta' && value ? { ...respuesta, esCorrecta: false } : respuesta
            )
          }
        : pregunta
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {evaluacion ? 'Editar Evaluación' : 'Nueva Evaluación'}
            </h2>
            <p className="text-sm text-gray-600">
              Paso {step} de 2: {step === 1 ? 'Información básica' : 'Preguntas'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            /* Step 1: Datos básicos */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la evaluación *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.titulo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Evaluación de Seguridad Industrial"
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
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                    errors.descripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe el objetivo de esta evaluación..."
                />
                {errors.descripcion && (
                  <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota mínima para aprobar (%) *
                </label>
                <input
                  type="number"
                  name="notaMinima"
                  value={formData.notaMinima}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.notaMinima ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.notaMinima && (
                  <p className="text-red-500 text-sm mt-1">{errors.notaMinima}</p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNext}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Preguntas */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">Preguntas</h3>
                <button
                  onClick={agregarPregunta}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Pregunta
                </button>
              </div>

              {preguntas.map((pregunta, preguntaIndex) => (
                <div key={preguntaIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-800">Pregunta {preguntaIndex + 1}</h4>
                    <button
                      onClick={() => eliminarPregunta(preguntaIndex)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enunciado *
                      </label>
                      <textarea
                        value={pregunta.enunciado}
                        onChange={(e) => actualizarPregunta(preguntaIndex, 'enunciado', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="Escribe la pregunta..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Puntaje
                      </label>
                      <input
                        type="number"
                        value={pregunta.puntaje}
                        onChange={(e) => actualizarPregunta(preguntaIndex, 'puntaje', parseInt(e.target.value))}
                        min="1"
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Respuestas (marca la correcta)
                        </label>
                        <button
                          onClick={() => agregarRespuesta(preguntaIndex)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          + Agregar respuesta
                        </button>
                      </div>

                      {pregunta.respuestas.map((respuesta, respuestaIndex) => (
                        <div key={respuestaIndex} className="flex items-center gap-3 mb-2">
                          <input
                            type="radio"
                            name={`pregunta-${preguntaIndex}`}
                            checked={respuesta.esCorrecta}
                            onChange={() => actualizarRespuesta(preguntaIndex, respuestaIndex, 'esCorrecta', true)}
                            className="text-purple-600"
                          />
                          <input
                            type="text"
                            value={respuesta.texto}
                            onChange={(e) => actualizarRespuesta(preguntaIndex, respuestaIndex, 'texto', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Texto de la respuesta..."
                          />
                          {pregunta.respuestas.length > 2 && (
                            <button
                              onClick={() => eliminarRespuesta(preguntaIndex, respuestaIndex)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {preguntas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay preguntas agregadas</p>
                  <button
                    onClick={agregarPregunta}
                    className="mt-2 text-purple-600 hover:text-purple-700"
                  >
                    Agregar la primera pregunta
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← Anterior
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Crear Evaluación
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluacionModal;