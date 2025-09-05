package com.capacitapro.backend.controller;

import com.capacitapro.backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor

public class FileUploadController {

    private final CloudinaryService cloudinaryService;
    private final Environment environment;
    
    @Value("${file.upload.upload-dir:uploads/}")
    private String uploadDir;
    
    @Value("${file.upload.base-url:${server.base-url:http://localhost:8080}}")
    private String baseUrl;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== INICIANDO SUBIDA DE ARCHIVO ===");
            System.out.println("Archivo: " + file.getOriginalFilename());
            System.out.println("Tamaño: " + formatFileSize(file.getSize()));
            System.out.println("Tipo: " + file.getContentType());
            
            // Validaciones previas
            Map<String, Object> validation = validateFile(file);
            if (validation.containsKey("error")) {
                return ResponseEntity.badRequest().body(validation);
            }

            // Verificar si estamos en producción
            boolean isProduction = "prod".equals(environment.getProperty("spring.profiles.active"));
            
            if (isProduction) {
                // Usar Cloudinary en producción
                return uploadToCloudinaryOptimized(file);
            } else {
                // Usar almacenamiento local en desarrollo
                return uploadToLocal(file);
            }

        } catch (Exception e) {
            System.err.println("Error en subida: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al subir el archivo: " + e.getMessage()));
        }
    }
    
    @PostMapping("/upload-async")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> uploadFileAsync(@RequestParam("file") MultipartFile file) {
        try {
            // Validaciones previas
            Map<String, Object> validation = validateFile(file);
            if (validation.containsKey("error")) {
                return ResponseEntity.badRequest().body(validation);
            }
            
            // Generar ID único para seguimiento
            String uploadId = UUID.randomUUID().toString();
            
            // Iniciar subida asíncrona
            cloudinaryService.uploadFileAsync(file, uploadId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("uploadId", uploadId);
            response.put("status", "uploading");
            response.put("message", "Subida iniciada. Use /upload-status/{uploadId} para verificar progreso");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
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
        long startTime = System.currentTimeMillis();
        
        String folder = "transyt/" + (file.getContentType().startsWith("video/") ? "videos" : "files");
        
        System.out.println("Subiendo a Cloudinary - Carpeta: " + folder);
        
        Map<String, Object> uploadResult;
        if (file.getContentType().startsWith("video/")) {
            uploadResult = cloudinaryService.uploadVideoOptimized(file, folder);
        } else {
            uploadResult = cloudinaryService.uploadFileOptimized(file, folder);
        }
        
        long uploadTime = System.currentTimeMillis() - startTime;
        System.out.println("✅ Subida completada en " + uploadTime + "ms");
        System.out.println("URL: " + uploadResult.get("secure_url"));
        
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
        
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> validateFile(MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        
        if (file.isEmpty()) {
            result.put("error", "El archivo está vacío");
            return result;
        }
        
        // Validar tamaño máximo (500MB para videos, 50MB para otros)
        long maxSize = file.getContentType().startsWith("video/") ? 500L * 1024 * 1024 : 50L * 1024 * 1024;
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
            System.out.println("=== SERVING FILE ===");
            System.out.println("Filename: " + filename);
            System.out.println("Is Preview: " + isPreview);
            System.out.println("Upload Dir: " + uploadDir);
            
            Path filePath = Paths.get(uploadDir).resolve(filename);
            System.out.println("File Path: " + filePath.toAbsolutePath());
            System.out.println("File Exists: " + java.nio.file.Files.exists(filePath));
            
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
}
