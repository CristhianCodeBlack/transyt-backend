import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EvaluacionViewer = () => {
  const { evaluacionId } = useParams();
  const [evaluacion, setEvaluacion] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    loadEvaluacion();
  }, [evaluacionId]);

  const loadEvaluacion = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/evaluaciones/${evaluacionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvaluacion(data);
      } else {
        throw new Error('Error al cargar evaluación');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const handleRespuesta = (preguntaId, respuesta) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: respuesta
    }));
  };

  const handleEnviar = async () => {
    if (Object.keys(respuestas).length < evaluacion.preguntas.length) {
      toast.error('Por favor responde todas las preguntas');
      return;
    }

    setEnviando(true);
    try {
      const response = await fetch(`http://localhost:8080/api/evaluaciones/${evaluacionId}/responder-empleado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ respuestas })
      });
      
      if (response.ok) {
        const resultado = await response.json();
        
        if (resultado.aprobado) {
          toast.success(`¡Felicidades! Evaluación aprobada con ${resultado.puntuacion}%`);
        } else {
          toast.error(`Evaluación no aprobada. Puntuación: ${resultado.puntuacion}%. Nota mínima: ${resultado.notaMinima}%`);
        }
        
        setTimeout(() => {
          window.close();
        }, 3000);
      } else {
        let errorMessage = 'Error al enviar respuestas';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Si no puede parsear JSON, usar mensaje genérico
          if (response.status === 403) {
            errorMessage = 'No tienes permisos para realizar esta acción';
          } else if (response.status === 401) {
            errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente';
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al enviar la evaluación');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{evaluacion?.titulo || 'Evaluación'}</h1>
              <p className="text-gray-600">{evaluacion?.descripcion}</p>
            </div>
            <button
              onClick={() => window.close()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {evaluacion?.preguntas ? (
          <>
            <div className="space-y-8">
              {evaluacion.preguntas.map((pregunta, index) => (
                <div key={pregunta.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {index + 1}. {pregunta.enunciado}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {pregunta.tipo === 'texto' ? (
                      <textarea
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="4"
                        placeholder="Escribe tu respuesta aquí..."
                        onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                      />
                    ) : (
                      pregunta.respuestas?.map((respuesta) => (
                        <label 
                          key={respuesta.id}
                          className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`pregunta-${pregunta.id}`}
                            value={respuesta.id}
                            onChange={() => handleRespuesta(pregunta.id, respuesta.id)}
                            className="mr-3"
                          />
                          <span className="text-gray-900">{respuesta.texto}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleEnviar}
                disabled={enviando}
                className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  enviando
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {enviando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Enviar Evaluación
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No se pudo cargar la evaluación</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluacionViewer;