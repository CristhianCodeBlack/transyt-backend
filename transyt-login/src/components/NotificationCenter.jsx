import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Download, Wifi, WifiOff } from 'lucide-react';
import notificationService from '../services/notificationService';
import offlineService from '../services/offlineService';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageStats, setStorageStats] = useState(null);

  useEffect(() => {
    // Conectar a notificaciones
    notificationService.connect();

    // Suscribirse a nuevas notificaciones
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Cargar notificaciones existentes
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getNotifications().filter(n => !n.read).length);

    // Escuchar cambios de conectividad
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cargar estadísticas de almacenamiento
    setStorageStats(offlineService.getStorageStats());

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      notificationService.disconnect();
    };
  }, []);

  const handleMarkAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) {
        notificationService.markAsRead(n.id);
      }
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    notificationService.clearNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'success': '✅',
      'info': 'ℹ️',
      'warning': '⚠️',
      'error': '❌',
      'course_completed': '🎉',
      'certificate_ready': '🏆',
      'course_assigned': '📚'
    };
    return icons[type] || '🔔';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modal de notificaciones */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-bold">Notificaciones</h3>
                    <div className="flex items-center gap-2 text-sm text-blue-100">
                      {isOnline ? (
                        <>
                          <Wifi className="h-4 w-4" />
                          <span>En línea</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-4 w-4" />
                          <span>Modo offline</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Estadísticas de almacenamiento offline */}
            {storageStats && (
              <div className="p-3 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Download className="h-3 w-3 text-blue-600" />
                    <span className="text-blue-700 font-medium">
                      {storageStats.coursesCount} cursos offline
                    </span>
                  </div>
                  <span className="text-blue-600">{storageStats.totalSize}</span>
                </div>
              </div>
            )}

            {/* Acciones */}
            {notifications.length > 0 && (
              <div className="p-3 border-b border-gray-100 flex gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Marcar todas como leídas
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
            )}

            {/* Lista de notificaciones */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No hay notificaciones</p>
                  <p className="text-gray-400 text-sm">Te notificaremos sobre tu progreso</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {notification.title || 'Notificación'}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-1"
                            >
                              <Check className="h-3 w-3" />
                              Marcar leída
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;