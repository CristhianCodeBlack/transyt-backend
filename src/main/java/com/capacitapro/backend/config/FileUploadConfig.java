package com.capacitapro.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

@Configuration
@ConfigurationProperties(prefix = "file.upload")
public class FileUploadConfig {

    private String uploadDir = "uploads/";
    private long maxFileSize = 50 * 1024 * 1024; // 50MB
    private long maxRequestSize = 50 * 1024 * 1024; // 50MB

    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    // Getters y setters
    public String getUploadDir() { return uploadDir; }
    public void setUploadDir(String uploadDir) { this.uploadDir = uploadDir; }
    public long getMaxFileSize() { return maxFileSize; }
    public void setMaxFileSize(long maxFileSize) { this.maxFileSize = maxFileSize; }
    public long getMaxRequestSize() { return maxRequestSize; }
    public void setMaxRequestSize(long maxRequestSize) { this.maxRequestSize = maxRequestSize; }
}