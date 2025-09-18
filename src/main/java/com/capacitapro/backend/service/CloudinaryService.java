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
                "chunk_size", 6000000 // 6MB chunks
        );
        
        return cloudinary.uploader().upload(file.getBytes(), options);
    }
    
    // MÉTODOS OPTIMIZADOS PARA SUBIDA RÁPIDA
    public Map<String, Object> uploadFileOptimized(MultipartFile file, String folder) throws IOException {
        System.out.println("\n📁 ========== CLOUDINARY SERVICE - UPLOAD FILE ===========");
        System.out.println("📄 Archivo: " + file.getOriginalFilename());
        System.out.println("📁 Carpeta: " + folder);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // LOG: Verificar cloudinary
            if (cloudinary == null) {
                System.err.println("❌ Cloudinary instance es NULL!");
                throw new IOException("Cloudinary no inicializado");
            }
            System.out.println("✅ Cloudinary instance disponible");
            
            // LOG: Preparar bytes
            System.out.println("💾 Convirtiendo archivo a bytes...");
            byte[] fileBytes = file.getBytes();
            System.out.println("✅ Bytes obtenidos: " + fileBytes.length);
            
            // LOG: Configurar opciones (optimizado para plan gratuito)
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto",
                    "quality", "auto:low", // Calidad reducida
                    "fetch_format", "auto",
                    "timeout", 120000, // 2 minutos
                    "chunk_size", 1000000 // 1MB chunks
            );
            System.out.println("🔧 Opciones configuradas: " + options);
            
            // LOG: Iniciar subida
            System.out.println("🚀 Iniciando subida a Cloudinary...");
            Map<String, Object> result = cloudinary.uploader().upload(fileBytes, options);
            
            long uploadTime = System.currentTimeMillis() - startTime;
            System.out.println("\n✅ ¡ARCHIVO SUBIDO EXITOSAMENTE!");
            System.out.println("⏱️ Tiempo: " + uploadTime + "ms");
            System.out.println("🔗 URL: " + result.get("secure_url"));
            System.out.println("🏷️ Public ID: " + result.get("public_id"));
            
            return result;
            
        } catch (IOException e) {
            long failTime = System.currentTimeMillis() - startTime;
            System.err.println("\n❌ ERROR EN CLOUDINARY SERVICE (IOException):");
            System.err.println("   ⏱️ Tiempo transcurrido: " + failTime + "ms");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🔍 Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Ninguna"));
            throw e;
            
        } catch (Exception e) {
            long failTime = System.currentTimeMillis() - startTime;
            System.err.println("\n❌ ERROR INESPERADO EN CLOUDINARY SERVICE:");
            System.err.println("   ⏱️ Tiempo transcurrido: " + failTime + "ms");
            System.err.println("   ❌ Tipo: " + e.getClass().getSimpleName());
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🔍 Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Ninguna"));
            e.printStackTrace();
            throw new IOException("Error en Cloudinary: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> uploadVideoOptimized(MultipartFile file, String folder) throws IOException {
        System.out.println("\n🎥 ========== CLOUDINARY SERVICE - UPLOAD VIDEO ===========");
        System.out.println("🎥 Video: " + file.getOriginalFilename());
        System.out.println("📁 Carpeta: " + folder);
        System.out.println("📊 Tamaño: " + (file.getSize() / (1024.0 * 1024.0)) + " MB");
        
        long startTime = System.currentTimeMillis();
        
        try {
            // LOG: Verificar cloudinary
            if (cloudinary == null) {
                System.err.println("❌ Cloudinary instance es NULL!");
                throw new IOException("Cloudinary no inicializado");
            }
            System.out.println("✅ Cloudinary instance disponible");
            
            // LOG: Preparar bytes
            System.out.println("💾 Convirtiendo video a bytes...");
            byte[] fileBytes = file.getBytes();
            System.out.println("✅ Bytes obtenidos: " + fileBytes.length + " (" + (fileBytes.length / (1024.0 * 1024.0)) + " MB)");
            
            // LOG: Configurar opciones para video (sin eager para evitar errores)
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "video",
                    "quality", "auto:good", // Calidad buena pero optimizada
                    "format", "mp4",
                    "timeout", 120000, // 2 minutos máximo
                    "chunk_size", 1000000 // 1MB chunks para plan gratuito
                    // Removido eager y eager_async para evitar ClassCastException
            );
            System.out.println("🔧 Opciones de video configuradas: " + options);
            
            // LOG: Iniciar subida de video
            System.out.println("🚀 Iniciando subida de VIDEO a Cloudinary...");
            System.out.println("⚠️ Esto puede tomar varios minutos para videos grandes...");
            
            Map<String, Object> result = cloudinary.uploader().upload(fileBytes, options);
            
            long uploadTime = System.currentTimeMillis() - startTime;
            System.out.println("\n🎉 ¡VIDEO SUBIDO EXITOSAMENTE!");
            System.out.println("⏱️ Tiempo total: " + uploadTime + "ms (" + (uploadTime/1000.0) + " segundos)");
            System.out.println("🔗 URL: " + result.get("secure_url"));
            System.out.println("🏷️ Public ID: " + result.get("public_id"));
            System.out.println("🎥 Duración: " + result.get("duration") + " segundos");
            System.out.println("🖼️ Dimensiones: " + result.get("width") + "x" + result.get("height"));
            
            return result;
            
        } catch (IOException e) {
            long failTime = System.currentTimeMillis() - startTime;
            System.err.println("\n❌ ERROR EN SUBIDA DE VIDEO (IOException):");
            System.err.println("   ⏱️ Tiempo transcurrido: " + failTime + "ms");
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🔍 Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Ninguna"));
            throw e;
            
        } catch (Exception e) {
            long failTime = System.currentTimeMillis() - startTime;
            System.err.println("\n❌ ERROR INESPERADO EN SUBIDA DE VIDEO:");
            System.err.println("   ⏱️ Tiempo transcurrido: " + failTime + "ms");
            System.err.println("   ❌ Tipo: " + e.getClass().getSimpleName());
            System.err.println("   ❌ Mensaje: " + e.getMessage());
            System.err.println("   🔍 Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "Ninguna"));
            e.printStackTrace();
            throw new IOException("Error en subida de video: " + e.getMessage(), e);
        }
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