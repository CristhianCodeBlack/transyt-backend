package com.capacitapro.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utilidades de seguridad para sanitizar input y prevenir vulnerabilidades
 */
public class SecurityUtils {
    
    private static final Logger securityLog = LoggerFactory.getLogger("SECURITY");
    
    /**
     * Sanitiza texto para logging seguro, previniendo log injection
     * @param input Texto a sanitizar
     * @return Texto sanitizado seguro para logs
     */
    public static String sanitizeForLog(String input) {
        if (input == null) {
            return "null";
        }
        
        return input
                .replaceAll("[\r\n\t]", "_")  // Reemplazar caracteres de control
                .replaceAll("[\\p{Cntrl}]", "_")  // Reemplazar otros caracteres de control
                .replaceAll("\\$\\{[^}]*\\}", "[FILTERED]")  // Filtrar expresiones ${...}
                .replaceAll("%[0-9a-fA-F]{2}", "[HEX]")  // Filtrar encoding hexadecimal
                .trim();
    }
    
    /**
     * Sanitiza nombre de usuario para logging seguro
     * @param username Nombre de usuario
     * @return Nombre sanitizado
     */
    public static String sanitizeUsername(String username) {
        if (username == null) {
            return "[NULL_USER]";
        }
        
        // Mantener solo caracteres alfanuméricos, puntos, guiones y @
        String sanitized = username.replaceAll("[^a-zA-Z0-9@._-]", "_");
        
        // Limitar longitud para evitar logs excesivamente largos
        if (sanitized.length() > 50) {
            sanitized = sanitized.substring(0, 47) + "...";
        }
        
        return sanitized;
    }
    
    /**
     * Sanitiza ID numérico para logging
     * @param id ID a sanitizar
     * @return ID sanitizado o placeholder seguro
     */
    public static String sanitizeId(Object id) {
        if (id == null) {
            return "[NULL_ID]";
        }
        
        String idStr = id.toString();
        // Solo permitir números
        if (idStr.matches("^[0-9]+$")) {
            return idStr;
        }
        
        return "[INVALID_ID]";
    }
    
    /**
     * Log de eventos de seguridad
     * @param event Evento de seguridad
     * @param details Detalles adicionales
     */
    public static void logSecurityEvent(String event, String details) {
        securityLog.warn("SECURITY EVENT: {} - {}", event, sanitizeForLog(details));
    }
    
    /**
     * Log de intento de acceso no autorizado
     * @param username Usuario que intentó el acceso
     * @param resource Recurso al que intentó acceder
     */
    public static void logUnauthorizedAccess(String username, String resource) {
        securityLog.warn("UNAUTHORIZED ACCESS: User {} attempted to access {}", 
                sanitizeUsername(username), sanitizeForLog(resource));
    }
}