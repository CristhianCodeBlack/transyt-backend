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
        
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", secure
        ));
    }

    public Map<String, Object> uploadFile(MultipartFile file, String folder) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto",
                "quality", "auto:good",
                "fetch_format", "auto"
        ));
    }

    public Map<String, Object> uploadVideo(MultipartFile file, String folder) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "video",
                "quality", "auto:good",
                "format", "mp4"
        ));
    }
    
    // MÉTODOS OPTIMIZADOS PARA SUBIDA RÁPIDA
    public Map<String, Object> uploadFileOptimized(MultipartFile file, String folder) throws IOException {
        System.out.println("Subiendo archivo optimizado: " + file.getOriginalFilename());
        long startTime = System.currentTimeMillis();
        
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "auto",
                "quality", "auto:low", // Calidad más baja para subida rápida
                "fetch_format", "auto",
                "eager", "c_scale,w_800", // Pre-generar versión optimizada
                "timeout", 120 // Timeout de 2 minutos
        ));
        
        long uploadTime = System.currentTimeMillis() - startTime;
        System.out.println("Archivo subido en " + uploadTime + "ms");
        
        return result;
    }

    public Map<String, Object> uploadVideoOptimized(MultipartFile file, String folder) throws IOException {
        System.out.println("Subiendo video optimizado: " + file.getOriginalFilename());
        long startTime = System.currentTimeMillis();
        
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "video",
                "quality", "auto:low", // Calidad más baja para subida rápida
                "format", "mp4",
                "video_codec", "h264", // Codec eficiente
                "audio_codec", "aac", // Audio eficiente
                "bit_rate", "1m", // Bitrate reducido para subida rápida
                "fps", "24", // FPS estándar
                "timeout", 300 // Timeout de 5 minutos para videos
        ));
        
        long uploadTime = System.currentTimeMillis() - startTime;
        System.out.println("Video subido en " + uploadTime + "ms");
        
        return result;
    }

    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
    
    // MÉTODOS PARA SUBIDA ASÍNCRONA
    private final Map<String, Map<String, Object>> uploadStatus = new java.util.concurrent.ConcurrentHashMap<>();
    
    @org.springframework.scheduling.annotation.Async
    public void uploadFileAsync(MultipartFile file, String uploadId) {
        try {
            // Actualizar estado inicial
            Map<String, Object> status = new HashMap<>();
            status.put("status", "uploading");
            status.put("progress", 0);
            status.put("message", "Iniciando subida...");
            uploadStatus.put(uploadId, status);
            
            // Determinar carpeta
            String folder = "transyt/" + (file.getContentType().startsWith("video/") ? "videos" : "files");
            
            // Subir archivo
            Map<String, Object> result;
            if (file.getContentType().startsWith("video/")) {
                result = uploadVideoOptimized(file, folder);
            } else {
                result = uploadFileOptimized(file, folder);
            }
            
            // Actualizar estado final
            status.put("status", "completed");
            status.put("progress", 100);
            status.put("message", "Subida completada");
            status.put("url", result.get("secure_url"));
            status.put("public_id", result.get("public_id"));
            
        } catch (Exception e) {
            // Actualizar estado de error
            Map<String, Object> status = uploadStatus.get(uploadId);
            if (status == null) status = new HashMap<>();
            status.put("status", "error");
            status.put("progress", 0);
            status.put("message", "Error: " + e.getMessage());
            uploadStatus.put(uploadId, status);
        }
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