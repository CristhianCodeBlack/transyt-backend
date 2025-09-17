package com.capacitapro.backend.controller;

import com.capacitapro.backend.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final CloudinaryService cloudinaryService;

    @GetMapping("/cloudinary")
    public ResponseEntity<Map<String, Object>> testCloudinary() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "Cloudinary configurado correctamente");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-simple")
    public ResponseEntity<Map<String, Object>> testUpload(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("🧪 TEST UPLOAD - Archivo: " + file.getOriginalFilename());
            System.out.println("🧪 TEST UPLOAD - Tamaño: " + file.getSize());
            System.out.println("🧪 TEST UPLOAD - Tipo: " + file.getContentType());

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Archivo vacío"));
            }

            String folder = "transyt/test";
            Map<String, Object> result = cloudinaryService.uploadFileOptimized(file, folder);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", result.get("secure_url"));
            response.put("public_id", result.get("public_id"));
            response.put("filename", file.getOriginalFilename());

            System.out.println("🧪 TEST UPLOAD - ¡ÉXITO! URL: " + result.get("secure_url"));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("🧪 TEST UPLOAD - ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error: " + e.getMessage()));
        }
    }
}