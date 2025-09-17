package com.capacitapro.backend.controller;

import com.capacitapro.backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.annotation.security.PermitAll;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {

    private static final Logger log = LoggerFactory.getLogger(FileUploadController.class);

    private final CloudinaryService cloudinaryService;
    private final Environment environment;
    
    @Value("${file.upload.upload-dir:uploads/}")
    private String uploadDir;
    
    @Value("${file.upload.base-url:${server.base-url:http://localhost:8080}}")
    private String baseUrl;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        System.out.println("\n🚀 =================== INICIO SUBIDA ARCHIVO ===================");
        System.out.println("⏰ Timestamp: " + new java.util.Date());
        System.out.println("🔧 Thread: " + Thread.currentThread().getName());
        
        try {
            // LOG 1: Información básica del archivo
            System.out.println("\n📁 INFORMACIÓN DEL ARCHIVO:");
            System.out.println("   📄 Nombre: " + file.getOriginalFilename());
            System.out.println("   📊 Tamaño: " + formatFileSize(file.getSize()) + " (" + file.getSize() + " bytes)");
            System.out.println("   🏷️ Tipo MIME: " + file.getContentType());
            System.out.println("   ❓ Vacío: " + file.isEmpty());
            
            // LOG 2: Variables de entorno
            System.out.println("\n🌍 VARIABLES DE ENTORNO:");
            System.out.println("   🏭 Perfil activo: " + environment.getProperty("spring.profiles.active"));
            System.out.println("   ☁️ Cloud name: " + environment.getProperty("cloudinary.cloud-name"));
            System.out.println("   🔑 API key: " + environment.getProperty("cloudinary.api-key"));
            System.out.println("   🔒 API secret: " + (environment.getProperty("cloudinary.api-secret") != null ? "[CONFIGURADO]" : "[NO CONFIGURADO]"));
            System.out.println("   🔐 Secure: " + environment.getProperty("cloudinary.secure"));
            
            // LOG 3: Memoria disponible
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long totalMemory = runtime.totalMemory();
            long freeMemory = runtime.freeMemory();
            long usedMemory = totalMemory - freeMemory;
            
            System.out.println("\n💾 ESTADO DE MEMORIA:");
            System.out.println("   📈 Máxima: " + formatFileSize(maxMemory));
            System.out.println("   📊 Total: " + formatFileSize(totalMemory));
            System.out.println("   🆓 Libre: " + formatFileSize(freeMemory));
            System.out.println("   🔥 Usada: " + formatFileSize(usedMemory));
            System.out.println("   ⚠️ Uso %: " + String.format("%.1f%%", (usedMemory * 100.0) / maxMemory));
            
            // LOG 4: Validación del archivo
            System.out.println("\n✅ VALIDANDO ARCHIVO...");
            Map<String, Object> validation = validateFile(file);
            if (validation.containsKey("error")) {
                System.err.println("❌ VALIDACIÓN FALLÓ: " + validation.get("error"));
                return ResponseEntity.badRequest().body(validation);
            }
            System.out.println("✅ Archivo válido");

            // LOG 5: Determinar entorno
            boolean isProduction = "prod".equals(environment.getProperty("spring.profiles.active"));
            System.out.println("\n🏭 ENTORNO DETECTADO: " + (isProduction ? "PRODUCCIÓN" : "DESARROLLO"));
            
            if (isProduction) {
                System.out.println("☁️ Usando Cloudinary para subida");
                return uploadToCloudinaryOptimized(file);
            } else {
                System.out.println("💾 Usando almacenamiento local");
                return uploadToLocal(file);
            }

        } catch (OutOfMemoryError e) {
            System.err.println("\n💥 ERROR DE MEMORIA:");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   📊 Tamaño archivo: " + formatFileSize(file.getSize()));
            e.printStackTrace();
            return ResponseEntity.status(507).body(Map.of("error", "Archivo demasiado grande para la memoria disponible"));
            
        } catch (java.io.IOException e) {
            System.err.println("\n💥 ERROR DE E/S:");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🔍 Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Desconocida"));
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Error de entrada/salida: " + e.getMessage()));
            
        } catch (java.net.SocketTimeoutException e) {
            System.err.println("\n💥 ERROR DE TIMEOUT:");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   ⏱️ Tiempo agotado en conexión de red");
            e.printStackTrace();
            return ResponseEntity.status(408).body(Map.of("error", "Timeout en la subida. Intenta con un archivo más pequeño."));
            
        } catch (java.net.ConnectException e) {
            System.err.println("\n💥 ERROR DE CONEXIÓN:");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🌐 No se pudo conectar a Cloudinary");
            e.printStackTrace();
            return ResponseEntity.status(503).body(Map.of("error", "No se pudo conectar al servicio de almacenamiento"));
            
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("cloudinary")) {
                System.err.println("\n💥 ERROR DE API CLOUDINARY:");
                System.err.println("   ❌ Mensaje: " + e.getMessage());
                System.err.println("   🔍 Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Ninguna"));
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of("error", "Error de Cloudinary: " + e.getMessage()));
            }
            throw e;
            
        } catch (SecurityException e) {
            System.err.println("\n💥 ERROR DE SEGURIDAD:");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🔒 Problema de permisos o autenticación");
            e.printStackTrace();
            return ResponseEntity.status(403).body(Map.of("error", "Error de seguridad: " + e.getMessage()));
            
        } catch (IllegalArgumentException e) {
            System.err.println("\n💥 ERROR DE ARGUMENTOS:");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   📝 Parámetros inválidos");
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Parámetros inválidos: " + e.getMessage()));
            
        } catch (Exception e) {
            System.err.println("\n💥 ERROR GENERAL NO CAPTURADO:");
            System.err.println("   ❌ Tipo: " + e.getClass().getSimpleName());
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🔍 Causa raíz: " + (e.getCause() != null ? e.getCause().getMessage() : "Desconocida"));
            System.err.println("   📚 Stack trace completo:");
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error inesperado: " + e.getClass().getSimpleName() + " - " + e.getMessage()));
        } finally {
            System.out.println("\n🏁 =================== FIN SUBIDA ARCHIVO ===================");
        }
    }
    
    @PostMapping("/upload-async-progress")
    public ResponseEntity<Map<String, Object>> uploadFileAsyncProgress(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("🚀 SUBIDA ASÍNCRONA INICIADA");
            
            // Validaciones previas
            Map<String, Object> validation = validateFile(file);
            if (validation.containsKey("error")) {
                return ResponseEntity.badRequest().body(validation);
            }
            
            // Generar ID único para seguimiento
            String uploadId = UUID.randomUUID().toString();
            
            System.out.println("🎯 Upload ID: " + uploadId);
            System.out.println("📁 Archivo: " + file.getOriginalFilename());
            System.out.println("📊 Tamaño: " + formatFileSize(file.getSize()));
            
            // Inicializar estado
            cloudinaryService.initUploadProgress(uploadId, file.getOriginalFilename(), file.getSize());
            
            // Iniciar subida asíncrona
            cloudinaryService.uploadFileAsyncWithProgress(file, uploadId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("uploadId", uploadId);
            response.put("status", "uploading");
            response.put("progress", 0);
            response.put("message", "Subida iniciada");
            response.put("filename", file.getOriginalFilename());
            response.put("size", file.getSize());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error iniciando subida: " + e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error iniciando subida: " + e.getMessage()));
        }
    }
    
    @GetMapping("/upload-status/{uploadId}")
    public ResponseEntity<Map<String, Object>> getUploadStatus(@PathVariable String uploadId) {
        Map<String, Object> status = cloudinaryService.getUploadStatus(uploadId);
        return ResponseEntity.ok(status);
    }
    
    private ResponseEntity<Map<String, Object>> uploadToCloudinaryOptimized(MultipartFile file) throws IOException {
        System.out.println("\n☁️ =============== SUBIDA A CLOUDINARY ===============");
        long startTime = System.currentTimeMillis();
        
        try {
            // LOG: Determinar carpeta
            String folder = "transyt/" + (file.getContentType().startsWith("video/") ? "videos" : "files");
            System.out.println("📁 Carpeta destino: " + folder);
            System.out.println("🎥 Es video: " + file.getContentType().startsWith("video/"));
            
            // LOG: Preparación
            System.out.println("\n🚀 PREPARANDO SUBIDA:");
            System.out.println("   📄 Archivo: " + file.getOriginalFilename());
            System.out.println("   📊 Tamaño: " + formatFileSize(file.getSize()));
            System.out.println("   🏷️ MIME: " + file.getContentType());
            System.out.println("   📁 Carpeta: " + folder);
            
            // LOG: Verificar servicio
            if (cloudinaryService == null) {
                System.err.println("❌ CloudinaryService es NULL!");
                throw new RuntimeException("CloudinaryService no inicializado");
            }
            System.out.println("✅ CloudinaryService disponible");
            
            // LOG: Iniciar subida
            System.out.println("\n⏳ INICIANDO SUBIDA A CLOUDINARY...");
            Map<String, Object> uploadResult;
            
            if (file.getContentType().startsWith("video/")) {
                System.out.println("🎥 Subiendo como VIDEO");
                uploadResult = cloudinaryService.uploadVideoOptimized(file, folder);
            } else {
                System.out.println("📄 Subiendo como ARCHIVO");
                uploadResult = cloudinaryService.uploadFileOptimized(file, folder);
            }
            
            // LOG: Resultado
            long uploadTime = System.currentTimeMillis() - startTime;
            System.out.println("\n🎉 ¡SUBIDA COMPLETADA EXITOSAMENTE!");
            System.out.println("⏱️ Tiempo total: " + uploadTime + "ms (" + String.format("%.2f", uploadTime/1000.0) + "s)");
            System.out.println("🔗 URL segura: " + uploadResult.get("secure_url"));
            System.out.println("🏷️ Public ID: " + uploadResult.get("public_id"));
            System.out.println("📊 Bytes: " + uploadResult.get("bytes"));
            System.out.println("🖼️ Formato: " + uploadResult.get("format"));
            System.out.println("🔍 Tipo recurso: " + uploadResult.get("resource_type"));
            
            // LOG: Construir respuesta
            System.out.println("\n📦 CONSTRUYENDO RESPUESTA...");
            Map<String, Object> response = new HashMap<>();
            response.put("filename", uploadResult.get("public_id"));
            response.put("originalName", file.getOriginalFilename());
            response.put("size", file.getSize());
            response.put("contentType", file.getContentType());
            response.put("url", uploadResult.get("secure_url"));
            response.put("downloadUrl", uploadResult.get("secure_url"));
            response.put("cloudinary", true);
            response.put("uploadTime", uploadTime);
            response.put("optimized", true);
            response.put("cloudinaryResult", uploadResult); // Incluir resultado completo para debug
            
            System.out.println("✅ Respuesta construida correctamente");
            System.out.println("🎉 ¡TODO LISTO!");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("cloudinary")) {
                System.err.println("\n💥 ERROR ESPECÍFICO DE CLOUDINARY API:");
                System.err.println("   ❌ Mensaje: " + e.getMessage());
                System.err.println("   🔍 Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Ninguna"));
                throw new IOException("Error de Cloudinary: " + e.getMessage(), e);
            }
            throw e;
            
        } catch (java.net.SocketTimeoutException e) {
            System.err.println("\n💥 TIMEOUT EN CLOUDINARY:");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   ⏱️ Tiempo transcurrido: " + (System.currentTimeMillis() - startTime) + "ms");
            System.err.println("   📊 Tamaño archivo: " + formatFileSize(file.getSize()));
            throw e;
            
        } catch (IOException e) {
            System.err.println("\n💥 ERROR DE E/S EN CLOUDINARY:");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🔍 Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Ninguna"));
            System.err.println("   ⏱️ Tiempo transcurrido: " + (System.currentTimeMillis() - startTime) + "ms");
            throw e;
            
        } catch (Exception e) {
            System.err.println("\n💥 ERROR INESPERADO EN CLOUDINARY:");
            System.err.println("   ❌ Tipo: " + e.getClass().getSimpleName());
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🔍 Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Ninguna"));
            System.err.println("   ⏱️ Tiempo transcurrido: " + (System.currentTimeMillis() - startTime) + "ms");
            e.printStackTrace();
            throw new IOException("Error inesperado en Cloudinary: " + e.getMessage(), e);
        }
    }
    
    private Map<String, Object> validateFile(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        
        if (file.isEmpty()) {
            result.put("error", "El archivo está vacío");
            return result;
        }
        
        // Validar tamaño máximo (2GB para videos, 500MB para otros)
        long maxSize = file.getContentType().startsWith("video/") ? 2L * 1024 * 1024 * 1024 : 500L * 1024 * 1024;
        if (file.getSize() > maxSize) {
            result.put("error", "Archivo demasiado grande. Máximo: " + formatFileSize(maxSize));
            return result;
        }
        
        // Validar tipos permitidos
        String contentType = file.getContentType();
        if (!isAllowedFileType(contentType)) {
            result.put("error", "Tipo de archivo no permitido: " + contentType);
            return result;
        }
        
        result.put("valid", true);
        return result;
    }
    
    private boolean isAllowedFileType(String contentType) {
        return contentType != null && (
            contentType.startsWith("video/") ||
            contentType.startsWith("image/") ||
            contentType.equals("application/pdf") ||
            contentType.equals("application/msword") ||
            contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        );
    }
    
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024));
        return String.format("%.1f GB", bytes / (1024.0 * 1024 * 1024));
    }
    
    private ResponseEntity<Map<String, Object>> uploadToLocal(MultipartFile file) throws IOException {
        // Crear directorio si no existe
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // Guardar archivo
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Respuesta
        Map<String, Object> response = new HashMap<>();
        response.put("filename", uniqueFilename);
        response.put("originalName", originalFilename);
        response.put("size", file.getSize());
        response.put("contentType", file.getContentType());
        response.put("url", baseUrl + "/api/files/preview/" + uniqueFilename);
        response.put("downloadUrl", baseUrl + "/api/files/download/" + uniqueFilename);
        response.put("cloudinary", false);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(@PathVariable String filename) {
        return serveFile(filename, false);
    }
    
    @GetMapping("/preview/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> previewFile(@PathVariable String filename) {
        return serveFile(filename, true);
    }
    
    private ResponseEntity<org.springframework.core.io.Resource> serveFile(String filename, boolean isPreview) {
        try {
            // SEGURIDAD: Validar y sanitizar nombre de archivo
            String sanitizedFilename = sanitizeFilename(filename);
            if (sanitizedFilename == null) {
                return ResponseEntity.badRequest().build();
            }
            
            log.info("Serving file - Original: {}, Sanitized: {}, Preview: {}", 
                    filename, sanitizedFilename, isPreview);
            log.debug("Upload directory: {}", uploadDir);
            
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = uploadPath.resolve(sanitizedFilename).normalize();
            
            // SEGURIDAD: Verificar que el archivo esté dentro del directorio permitido
            if (!filePath.startsWith(uploadPath)) {
                log.warn("SECURITY: Path traversal attempt blocked for filename: {}", filename);
                return ResponseEntity.badRequest().build();
            }
            
            log.debug("File path: {}, Exists: {}", 
                    filePath.toAbsolutePath(), java.nio.file.Files.exists(filePath));
            
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                var responseBuilder = ResponseEntity.ok()
                        .header("Content-Type", contentType)
                        .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                        .header("X-Content-Type-Options", "nosniff");
                
                if (isPreview) {
                    // Headers para permitir iframe
                    responseBuilder
                        .header("Content-Security-Policy", "frame-ancestors 'self' http://localhost:5173 http://localhost:5174 http://localhost:5175 https://transyt-frontend.onrender.com")
                        .header("Cache-Control", "no-cache, no-store, must-revalidate")
                        .header("Pragma", "no-cache")
                        .header("Expires", "0");
                } else {
                    responseBuilder.header("X-Frame-Options", "DENY");
                }
                
                return responseBuilder.body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * SEGURIDAD: Sanitiza nombres de archivo para prevenir path traversal
     */
    private String sanitizeFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return null;
        }
        
        // Remover caracteres peligrosos y secuencias de path traversal
        String sanitized = filename
                .replaceAll("\\.\\./", "")  // Remover ../
                .replaceAll("\\.\\.\\\\", "") // Remover ..\\
                .replaceAll("[<>:\"/\\\\|?*]", "") // Remover caracteres inválidos
                .replaceAll("\\.\\.", "")  // Remover dobles puntos
                .trim();
        
        // Verificar que no esté vacío después de sanitizar
        if (sanitized.isEmpty()) {
            return null;
        }
        
        // Verificar que no sea solo puntos o espacios
        if (sanitized.matches("^[\\s\\.]+$")) {
            return null;
        }
        
        return sanitized;
    }
}
