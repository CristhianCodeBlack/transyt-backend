import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, User, BookOpen, FileText, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const SeguimientoTests = () => {
  const [tests, setTests] = useState([]);
  const [respuestasPendientes, setRespuestasPendientes] = useState([]);
  const [activeTab, setActiveTab] = useState('tests');
  const [loading, setLoading] = useState(false);
  const [selectedRespuesta, setSelectedRespuesta] = useState(null);
  const [showCalificarModal, setShowCalificarModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const empresaId = 1;
      
      const testsResponse = await fetch(`http://localhost:8080/api/seguimiento-tests/empresa/${empresaId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (testsResponse.ok) {
        const testsData = await testsResponse.json();
        setTests(testsData);
      }
      
      const pendientesResponse = await fetch(`http://localhost:8080/api/seguimiento-tests/respuestas-pendientes/${empresaId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (pendientesResponse.ok) {
        const pendientesData = await pendientesResponse.json();
        setRespuestasPendientes(pendientesData);
      }
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCalificar = (respuesta) => {
    setSelectedRespuesta(respuesta);
    setShowCalificarModal(true);
  };

  const submitCalificacion = async (puntaje, comentario) => {
    try {
      const response = await fetch(`http://localhost:8080/api/seguimiento-tests/calificar-respuesta/${selectedRespuesta.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ puntaje, comentario })
      });
      
      if (response.ok) {
        toast.success('Respuesta calificada exitosamente');
        setShowCalificarModal(false);
        setSelectedRespuesta(null);
        loadData();
      } else {
        toast.error('Error calificando respuesta');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error calificando respuesta');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getStatusBadge = (aprobado, pendientes) => {
    if (pendientes > 0) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pendiente</span>;
    }
    return aprobado ? 
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Aprobado</span> :
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Reprobado</span>;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Seguimiento de Tests</h1>
        <p className="text-gray-600">Monitorea el progreso y califica respuestas de los empleados</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'tests'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Tests Realizados ({tests.length})
        </button>
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pendientes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Respuestas Pendientes ({respuestasPendientes.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'tests' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso/Test</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntaje</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{test.usuario}</div>
                              <div className="text-sm text-gray-500">{test.correoUsuario}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{test.curso}</div>
                            <div className="text-sm text-gray-500">{test.test}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{test.puntajeObtenido}/{test.puntajeMaximo}</div>
                          <div className="text-xs text-gray-500">{Math.round((test.puntajeObtenido / test.puntajeMaximo) * 100)}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(test.aprobado, test.respuestasPendientes)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(test.fechaRealizacion)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pendientes' && (
            <div className="space-y-4">
              {respuestasPendientes.map((respuesta) => (
                <div key={respuesta.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{respuesta.usuario}</h3>
                      <p className="text-sm text-gray-600">{respuesta.curso} - {respuesta.test}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      {respuesta.puntajeMaximo} pts máx.
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Pregunta:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{respuesta.pregunta}</p>
                  </div>
                  
                  {respuesta.respuestaEsperada && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Respuesta Esperada:</h4>
                      <p className="text-green-700 bg-green-50 p-3 rounded">{respuesta.respuestaEsperada}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Respuesta del Usuario:</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded">{respuesta.respuestaTexto}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Respondido: {formatDate(respuesta.fechaRespuesta)}</span>
                    <button
                      onClick={() => handleCalificar(respuesta)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Calificar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showCalificarModal && selectedRespuesta && (
        <CalificarModal
          respuesta={selectedRespuesta}
          onClose={() => {
            setShowCalificarModal(false);
            setSelectedRespuesta(null);
          }}
          onSubmit={submitCalificacion}
        />
      )}
    </div>
  );
};

const CalificarModal = ({ respuesta, onClose, onSubmit }) => {
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(puntaje, comentario);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Calificar Respuesta</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntaje (0 - {respuesta.puntajeMaximo})
            </label>
            <input
              type="number"
              min="0"
              max={respuesta.puntajeMaximo}
              value={puntaje}
              onChange={(e) => setPuntaje(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Comentarios sobre la respuesta..."
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Calificar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeguimientoTests;