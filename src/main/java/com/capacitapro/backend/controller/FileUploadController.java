package com.capacitapro.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class FileUploadController {

    @Value("${file.upload.upload-dir:uploads/}")
    private String uploadDir;
    
    @Value("${file.upload.base-url:http://localhost:8080}")
    private String baseUrl;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío"));
            }

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

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al subir el archivo: " + e.getMessage()));
        }
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
                        .header("Content-Security-Policy", "frame-ancestors 'self' http://localhost:5173 http://localhost:5174 http://localhost:5175")
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