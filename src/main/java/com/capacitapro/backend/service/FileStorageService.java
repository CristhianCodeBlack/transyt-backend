package com.capacitapro.backend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    
    String storeFile(MultipartFile file, String tipo);
    
    Resource loadFileAsResource(String fileName);
    
    void deleteFile(String fileName);
    
    boolean isValidFileType(MultipartFile file, String tipo);
    
    String getFileExtension(String fileName);
}