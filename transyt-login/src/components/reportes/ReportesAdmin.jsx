import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Download } from 'lucide-react';
import { reportesService } from '../../services/dashboardService';
import toast from 'react-hot-toast';

const ReportesAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reporteData, setReporteData] = useState({
    usuarios: 0,
    cursos: 0,
    certificados: 0,
    progreso: 0,
    cursoProgreso: [],
    actividadMensual: {}
  });

  useEffect(() => {
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/reportes/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReporteData({
          usuarios: data.usuarios || 0,
          cursos: data.cursos || 0,
          certificados: data.certificados || 0,
          progreso: data.progreso || 0,
          cursoProgreso: data.cursoProgreso || [],
          actividadMensual: data.actividadMensual || {}
        });
      } else {
        throw new Error('Error al cargar reportes');
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type) => {
    try {
      // Generar contenido del reporte
      const content = type === 'excel' ? 
        generateCSVContent() : generateTXTContent();
      
      const blob = new Blob([content], { 
        type: type === 'excel' ? 'text/csv' : 'text/plain' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-capacitapro.${type === 'excel' ? 'csv' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Reporte exportado en ${type.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error al exportar reporte');
    }
  };
  
  const generateCSVContent = () => {
    let csv = 'Métrica,Valor\n';
    csv += `Usuarios,${reporteData.usuarios}\n`;
    csv += `Cursos,${reporteData.cursos}\n`;
    csv += `Certificados,${reporteData.certificados}\n`;
    csv += `Progreso Promedio,${reporteData.progreso}%\n\n`;
    csv += 'Curso,Progreso,Inscritos,Completados\n';
    reporteData.cursoProgreso.forEach(curso => {
      csv += `${curso.curso},${curso.progreso}%,${curso.inscritos || 0},${curso.completados || 0}\n`;
    });
    return csv;
  };
  
  const generateTXTContent = () => {
    let txt = 'REPORTE CAPACITAPRO\n';
    txt += '==================\n\n';
    txt += `Usuarios: ${reporteData.usuarios}\n`;
    txt += `Cursos: ${reporteData.cursos}\n`;
    txt += `Certificados: ${reporteData.certificados}\n`;
    txt += `Progreso Promedio: ${reporteData.progreso}%\n\n`;
    txt += 'PROGRESO POR CURSO:\n';
    txt += '------------------\n';
    reporteData.cursoProgreso.forEach(curso => {
      txt += `${curso.curso}: ${curso.progreso}% (${curso.inscritos || 0} inscritos, ${curso.completados || 0} completados)\n`;
    });
    return txt;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas de la plataforma</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('txt')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            TXT
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Usuarios</p>
              <p className="text-3xl font-bold text-gray-800">{reporteData.usuarios}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cursos</p>
              <p className="text-3xl font-bold text-gray-800">{reporteData.cursos}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Certificados</p>
              <p className="text-3xl font-bold text-gray-800">{reporteData.certificados}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Progreso</p>
              <p className="text-3xl font-bold text-gray-800">{reporteData.progreso}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Progreso por Curso</h3>
          <div className="space-y-4">
            {reporteData.cursoProgreso && reporteData.cursoProgreso.length > 0 ? (
              reporteData.cursoProgreso.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{item.curso}</span>
                    <span className="text-sm text-gray-500">{item.progreso}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.progreso}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay datos de progreso disponibles</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Actividad Mensual</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{reporteData.actividadMensual.inscripciones || 0}</p>
              <p className="text-sm text-gray-600">Inscripciones</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{reporteData.actividadMensual.completados || 0}</p>
              <p className="text-sm text-gray-600">Completados</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{reporteData.actividadMensual.certificados || 0}</p>
              <p className="text-sm text-gray-600">Certificados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesAdmin;