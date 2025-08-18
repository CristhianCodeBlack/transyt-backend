import React, { useState, useEffect } from 'react';
import { Award, Download, Calendar, FileText } from 'lucide-react';
import { certificadoService } from '../services/certificadoService';

const MisCertificados = () => {
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
    } finally {
      setLoading(false);
    }
  };

  const descargarCertificado = async (certificadoId, codigoVerificacion) => {
    try {
      await certificadoService.descargarCertificado(certificadoId, codigoVerificacion);
    } catch (error) {
      console.error('Error descargando certificado:', error);
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
        <p className="text-gray-600">Certificados obtenidos por completar cursos</p>
      </div>

      {certificados.length === 0 ? (
        <div className="text-center py-12">
          <Award className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes certificados aún
          </h3>
          <p className="text-gray-500">
            Completa cursos para obtener certificados de finalización
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificados.map((certificado) => (
            <div
              key={certificado.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <Award className="h-8 w-8 text-white mb-2" />
                <h3 className="text-white font-semibold text-lg">
                  Certificado de Finalización
                </h3>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {certificado.curso.titulo}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {certificado.curso.descripcion}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Obtenido el {formatearFecha(certificado.fechaGeneracion)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-mono text-xs">
                      {certificado.codigoVerificacion}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => descargarCertificado(certificado.id, certificado.codigoVerificacion)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCertificados;