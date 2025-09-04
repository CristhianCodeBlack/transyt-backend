import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { evaluacionService } from '../../services/evaluacionService';
import toast from 'react-hot-toast';

const ResponderEvaluacion = ({ evaluacion, onClose }) => {
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    // Timer de 30 minutos por defecto
    const timer = 30 * 60; // 30 minutos en segundos
    setTimeLeft(timer);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRespuestaChange = (preguntaId, respuestaId) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: respuestaId
    }));
  };

  const handleSubmit = async () => {
    // Validar que todas las preguntas estén respondidas
    const preguntasRespondidas = Object.keys(respuestas).length;
    const totalPreguntas = evaluacion.preguntas?.length || 0;
    
    if (preguntasRespondidas < totalPreguntas) {
      // Sanitizar valores para evitar inyección de código
      const preguntasNum = Math.max(0, Math.min(999, parseInt(preguntasRespondidas) || 0));
      const totalNum = Math.max(0, Math.min(999, parseInt(totalPreguntas) || 0));
      
      const mensaje = `Solo has respondido ${preguntasNum} de ${totalNum} preguntas. ¿Deseas enviar la evaluación?`;
      if (!window.confirm(mensaje)) {
        return;
      }
    }

    setLoading(true);
    try {
      // Convertir respuestas al formato esperado por el backend
      const respuestasArray = evaluacion.preguntas.map(pregunta => ({
        preguntaId: pregunta.id,
        respuestaId: respuestas[pregunta.id] || null
      }));

      const result = await evaluacionService.responderEvaluacion(evaluacion.id, respuestasArray);
      setResultado(result);
      setShowResults(true);
      
      if (result.aprobado) {
        toast.success('¡Felicitaciones! Has aprobado la evaluación');
      } else {
        toast.error('No has aprobado la evaluación. Puedes intentarlo nuevamente');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          'Error al enviar la evaluación';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < evaluacion.preguntas.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  if (showResults && resultado) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              resultado.aprobado ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {resultado.aprobado ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {resultado.aprobado ? '¡Evaluación Aprobada!' : 'Evaluación No Aprobada'}
            </h3>
            
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">
                Puntaje obtenido: <span className="font-semibold">{resultado.puntajeObtenido}</span>
              </p>
              <p className="text-gray-600">
                Puntaje máximo: <span className="font-semibold">{resultado.puntajeMaximo}</span>
              </p>
              <p className="text-gray-600">
                Porcentaje: <span className="font-semibold">
                  {Math.round((resultado.puntajeObtenido / resultado.puntajeMaximo) * 100)}%
                </span>
              </p>
              <p className="text-gray-600">
                Nota mínima: <span className="font-semibold">{evaluacion.notaMinima}%</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const preguntaActual = evaluacion.preguntas[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{evaluacion.titulo}</h2>
            <p className="text-sm text-gray-600">{evaluacion.descripcion}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="h-5 w-5" />
              <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar - Navegación de preguntas */}
          <div className="w-64 bg-gray-50 p-4 border-r border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Preguntas</h3>
            <div className="space-y-2">
              {evaluacion.preguntas.map((pregunta, index) => (
                <button
                  key={pregunta.id}
                  onClick={() => goToQuestion(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentQuestion
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : respuestas[pregunta.id]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Pregunta {index + 1}</span>
                    {respuestas[pregunta.id] && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {pregunta.puntaje} puntos
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Progreso: {Object.keys(respuestas).length}/{evaluacion.preguntas.length}
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(Object.keys(respuestas).length / evaluacion.preguntas.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Pregunta {currentQuestion + 1} de {evaluacion.preguntas.length}
                </h3>
                <span className="text-sm text-gray-600">
                  {preguntaActual.puntaje} puntos
                </span>
              </div>
              
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                {preguntaActual.enunciado}
              </p>

              <div className="space-y-3">
                {preguntaActual.respuestas.map((respuesta) => (
                  <label
                    key={respuesta.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      respuestas[preguntaActual.id] === respuesta.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`pregunta-${preguntaActual.id}`}
                      value={respuesta.id}
                      checked={respuestas[preguntaActual.id] === respuesta.id}
                      onChange={() => handleRespuestaChange(preguntaActual.id, respuesta.id)}
                      className="text-purple-600 mr-3"
                    />
                    <span className="text-gray-700">{respuesta.texto}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navegación */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-3">
                {currentQuestion === evaluacion.preguntas.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Enviar Evaluación
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Siguiente →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponderEvaluacion;