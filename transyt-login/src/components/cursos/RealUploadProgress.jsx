import React from 'react';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';

const RealUploadProgress = ({ fileName, fileSize, progress, status, uploadSpeed, timeRemaining, onCancel }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatSpeed = (bytesPerSecond) => {
    if (!bytesPerSecond) return '';
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === Infinity) return '';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'text-emerald-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Upload className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <p className="text-sm font-medium text-gray-900 truncate max-w-64">{fileName}</p>
            <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
          </div>
        </div>
        
        {status === 'uploading' && onCancel && (
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Cancelar subida"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {status === 'uploading' ? 'Subiendo...' : 
             status === 'completed' ? '¡Completado!' : 
             status === 'error' ? 'Error' : 'Preparando...'}
          </span>
          <span className="text-sm font-bold text-gray-900">
            {Math.round(progress)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          >
            {status === 'uploading' && (
              <div className="h-full bg-white/30 animate-pulse rounded-full"></div>
            )}
          </div>
        </div>
      </div>

      {/* Speed and Time Info */}
      {status === 'uploading' && (uploadSpeed || timeRemaining) && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          {uploadSpeed && (
            <span>📊 {formatSpeed(uploadSpeed)}</span>
          )}
          {timeRemaining && (
            <span>⏱️ {formatTime(timeRemaining)} restante</span>
          )}
        </div>
      )}

      {/* Status Messages */}
      {status === 'completed' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-2 mt-2">
          <p className="text-xs text-emerald-700 font-medium">
            ✅ Archivo subido exitosamente a la nube
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
          <p className="text-xs text-red-700 font-medium">
            ❌ Error en la subida. Inténtalo de nuevo.
          </p>
        </div>
      )}
    </div>
  );
};

export default RealUploadProgress;