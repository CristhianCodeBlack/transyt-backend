import React, { useState, useEffect } from 'react';
import { Award, Download, Calendar, FileText, ExternalLink } from 'lucide-react';
import { certificadoService } from '../../services/certificadoService';
import toast from 'react-hot-toast';

const MisCertificadosEmpleado = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCertificados();
  }, []);

  const cargarCertificados = async () => {
    try {
      const data = await certificadoService.getMisCertificados();
      setCertificados(data);
    } catch (error) {
      console.error('Error cargando certificados:', error);
      toast.error('Error al cargar certificados');
    } finally {
      setLoading(false);
    }
  };

  const descargarCertificado = async (certificadoId, codigoVerificacion) => {
    try {
      await certificadoService.descargarCertificado(certificadoId, codigoVerificacion);
      toast.success('Certificado descargado');
    } catch (error) {
      console.error('Error descargando certificado:', error);
      toast.error('Error al descargar certificado');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Certificados</h1>
        <p className="text-gray-600">Certificados obtenidos por completar cursos exitosamente</p>
      </div>

      {certificados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
          <Award className="mx-auto h-20 w-20 text-gray-400 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No tienes certificados aún
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Completa cursos para obtener certificados de finalización que validen tu aprendizaje
          </p>
          <button 
            onClick={() => window.setEmpleadoTab('cursos')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Mis Cursos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificados.map((certificado) => (
            <div
              key={certificado.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-10 w-10" />
                  <div className="text-right">
                    <div className="text-xs opacity-90">Certificado</div>
                    <div className="text-sm font-semibold">#{certificado.id}</div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Certificado de Finalización
                </h3>
                <div className="text-sm opacity-90">
                  CapacitaPro - Sistema de Capacitación
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 text-lg mb-2">
                    {certificado.curso.titulo}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {certificado.curso.descripcion}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                    <span>Obtenido el {formatearFecha(certificado.fechaGeneracion)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-3 text-purple-500" />
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {certificado.codigoVerificacion}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => descargarCertificado(certificado.id, certificado.codigoVerificacion)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Certificado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {certificados.length > 0 && (
        <div className="mt-12 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Sobre tus certificados
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Los certificados se generan automáticamente al completar un curso</li>
                <li>• Cada certificado tiene un código único de verificación</li>
                <li>• Puedes descargar tus certificados en formato PDF</li>
                <li>• Los certificados son válidos y pueden ser presentados como evidencia de capacitación</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisCertificadosEmpleado;