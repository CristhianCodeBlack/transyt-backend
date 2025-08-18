import React from 'react';
import { Download, ExternalLink } from 'lucide-react';

const PDFViewer = ({ modulo, onDownload }) => {
  const pdfUrl = `http://localhost:8080/api/modulos/${modulo.id}/preview`;

  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-red-600 font-bold text-sm">PDF</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{modulo.nombreArchivo}</h3>
            <p className="text-sm text-gray-500">
              {(modulo.tamanioArchivo / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Descargar PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Abrir en nueva pestaña"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* PDF Embed */}
      <div className="h-96">
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={`PDF: ${modulo.titulo}`}
        />
      </div>
    </div>
  );
};

export default PDFViewer;