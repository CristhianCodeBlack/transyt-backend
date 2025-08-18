package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.config.FileUploadConfig;
import com.capacitapro.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {

    private final FileUploadConfig fileUploadConfig;
    
    // Tipos de archivo permitidos
    private final List<String> VIDEO_TYPES = Arrays.asList("video/mp4", "video/avi", "video/mov", "video/wmv");
    private final List<String> PDF_TYPES = Arrays.asList("application/pdf");
    
    @Override
    public String storeFile(MultipartFile file, String tipo) {
        if (!isValidFileType(file, tipo)) {
            throw new RuntimeException("Tipo de archivo no válido para el tipo de módulo: " + tipo);
        }
        
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Nombre de archivo inválido: " + fileName);
            }
            
            // Crear directorio si no existe
            Path uploadPath = Paths.get(fileUploadConfig.getUploadDir()).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            
            // Generar nombre único
            String fileExtension = getFileExtension(fileName);
            String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;
            
            // Guardar archivo
            Path targetLocation = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            return uniqueFileName;
            
        } catch (IOException ex) {
            throw new RuntimeException("No se pudo almacenar el archivo " + fileName, ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = Paths.get(fileUploadConfig.getUploadDir()).toAbsolutePath().normalize().resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("Archivo no encontrado: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Archivo no encontrado: " + fileName, ex);
        }
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(fileUploadConfig.getUploadDir()).toAbsolutePath().normalize().resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("No se pudo eliminar el archivo: " + fileName, ex);
        }
    }

    @Override
    public boolean isValidFileType(MultipartFile file, String tipo) {
        String contentType = file.getContentType();
        
        switch (tipo.toUpperCase()) {
            case "VIDEO":
                return VIDEO_TYPES.contains(contentType);
            case "PDF":
                return PDF_TYPES.contains(contentType);
            case "TEXTO":
                return true; // Para texto no se requiere archivo
            default:
                return false;
        }
    }

    @Override
    public String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}