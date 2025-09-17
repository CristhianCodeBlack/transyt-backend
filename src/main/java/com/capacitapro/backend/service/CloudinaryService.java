package com.capacitapro.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret,
            @Value("${cloudinary.secure}") boolean secure) {
        
        System.out.println("🔧 Configurando Cloudinary:");
        System.out.println("Cloud Name: " + cloudName);
        System.out.println("API Key: " + apiKey);
        System.out.println("Secure: " + secure);
        
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", secure
        ));
        
        System.out.println("✅ Cloudinary configurado exitosamente");
    }

    public Map<String, Object> uploadFile(MultipartFile file, String folder) throws IOException {
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto",
                "quality", "auto:good",
                "fetch_format", "auto",
                "timeout", 300000, // 5 minutos timeout
                "chunk_size", 6000000 // 6MB chunks para archivos grandes
        );
        
        return cloudinary.uploader().upload(file.getBytes(), options);
    }

    public Map<String, Object> uploadVideo(MultipartFile file, String folder) throws IOException {
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "video",
                "quality", "auto:good",
                "format", "mp4",
                "timeout", 600000, // 10 minutos timeout para videos
                "chunk_size", 6000000, // 6MB chunks
                "eager", "c_scale,w_1280,q_auto:good/mp4" // Optimización automática
        );
        
        return cloudinary.uploader().upload(file.getBytes(), options);
    }
    
    // MÉTODOS OPTIMIZADOS PARA SUBIDA RÁPIDA
    public Map<String, Object> uploadFileOptimized(MultipartFile file, String folder) throws IOException {
        System.out.println("Subiendo archivo: " + file.getOriginalFilename());
        long startTime = System.currentTimeMillis();
        
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto",
                "quality", "auto:good", // Mantener buena calidad
                "fetch_format", "auto"
        ));
        
        long uploadTime = System.currentTimeMillis() - startTime;
        System.out.println("✅ Archivo subido en " + uploadTime + "ms");
        
        return result;
    }

    public Map<String, Object> uploadVideoOptimized(MultipartFile file, String folder) throws IOException {
        System.out.println("Subiendo video: " + file.getOriginalFilename());
        long startTime = System.currentTimeMillis();
        
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "video",
                "quality", "auto:good", // Mantener buena calidad
                "format", "mp4"
        ));
        
        long uploadTime = System.currentTimeMillis() - startTime;
        System.out.println("✅ Video subido en " + uploadTime + "ms");
        
        return result;
    }

    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
    
    // MÉTODOS PARA SUBIDA ASÍNCRONA
    private final Map<String, Map<String, Object>> uploadStatus = new java.util.concurrent.ConcurrentHashMap<>();
    
    public void initUploadProgress(String uploadId, String filename, long fileSize) {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "initializing");
        status.put("progress", 0);
        status.put("message", "Preparando subida...");
        status.put("filename", filename);
        status.put("fileSize", fileSize);
        status.put("startTime", System.currentTimeMillis());
        uploadStatus.put(uploadId, status);
    }
    
    @org.springframework.scheduling.annotation.Async
    public void uploadFileAsyncWithProgress(MultipartFile file, String uploadId) {
        try {
            // Actualizar progreso: Validando
            updateProgress(uploadId, 10, "Validando archivo...");
            Thread.sleep(500); // Simular validación
            
            // Actualizar progreso: Preparando
            updateProgress(uploadId, 20, "Preparando subida a Cloudinary...");
            
            String folder = "transyt/" + (file.getContentType().startsWith("video/") ? "videos" : "files");
            
            // Actualizar progreso: Subiendo
            updateProgress(uploadId, 30, "Subiendo a Cloudinary...");
            
            Map<String, Object> result;
            if (file.getContentType().startsWith("video/")) {
                result = uploadVideoWithProgress(file, folder, uploadId);
            } else {
                result = uploadFileWithProgress(file, folder, uploadId);
            }
            
            // Actualizar progreso: Finalizando
            updateProgress(uploadId, 95, "Finalizando...");
            Thread.sleep(300);
            
            // Completado
            Map<String, Object> status = uploadStatus.get(uploadId);
            status.put("status", "completed");
            status.put("progress", 100);
            status.put("message", "✅ Subida completada exitosamente");
            status.put("url", result.get("secure_url"));
            status.put("public_id", result.get("public_id"));
            
            long totalTime = System.currentTimeMillis() - (Long) status.get("startTime");
            status.put("uploadTime", totalTime);
            
            System.out.println("✅ Subida completada: " + uploadId + " en " + totalTime + "ms");
            
        } catch (Exception e) {
            System.err.println("❌ Error en subida asíncrona: " + e.getMessage());
            Map<String, Object> status = uploadStatus.get(uploadId);
            if (status == null) status = new HashMap<>();
            status.put("status", "error");
            status.put("progress", 0);
            status.put("message", "❌ Error: " + e.getMessage());
            uploadStatus.put(uploadId, status);
        }
    }
    
    private void updateProgress(String uploadId, int progress, String message) {
        Map<String, Object> status = uploadStatus.get(uploadId);
        if (status != null) {
            status.put("progress", progress);
            status.put("message", message);
            System.out.println("📊 Progreso " + uploadId + ": " + progress + "% - " + message);
        }
    }
    
    private Map<String, Object> uploadVideoWithProgress(MultipartFile file, String folder, String uploadId) throws IOException {
        updateProgress(uploadId, 40, "Procesando video...");
        Map<String, Object> result = uploadVideoOptimized(file, folder);
        updateProgress(uploadId, 90, "Video procesado");
        return result;
    }
    
    private Map<String, Object> uploadFileWithProgress(MultipartFile file, String folder, String uploadId) throws IOException {
        updateProgress(uploadId, 50, "Procesando archivo...");
        Map<String, Object> result = uploadFileOptimized(file, folder);
        updateProgress(uploadId, 90, "Archivo procesado");
        return result;
    }
    
    public Map<String, Object> getUploadStatus(String uploadId) {
        Map<String, Object> status = uploadStatus.get(uploadId);
        if (status == null) {
            status = new HashMap<>();
            status.put("status", "not_found");
            status.put("message", "ID de subida no encontrado");
        }
        return status;
    }
}