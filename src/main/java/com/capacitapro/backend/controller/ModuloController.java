package com.capacitapro.backend.controller;

import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/modulos")
@RequiredArgsConstructor

public class ModuloController {
    
    @Value("${file.upload.base-url:http://localhost:8080}")
    private String baseUrl;

    private final ModuloRepository moduloRepository;
    private final CursoRepository cursoRepository;
    private final SubmoduloRepository submoduloRepository;

    @GetMapping("/curso/{cursoId}")
    // @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<List<Map<String, Object>>> getModulosByCurso(@PathVariable Long cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        List<Modulo> modulos = moduloRepository.findByCursoOrderByOrdenAsc(curso);
        
        List<Map<String, Object>> modulosDTO = modulos.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(modulosDTO);
    }

    @PostMapping("/curso/{cursoId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> createModulo(@PathVariable Long cursoId, @RequestBody Map<String, Object> moduloData) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        Modulo modulo = Modulo.builder()
                .titulo((String) moduloData.get("titulo"))
                .curso(curso)
                .orden((Integer) moduloData.get("orden"))
                .activo(true)
                .build();
        
        Modulo savedModulo = moduloRepository.save(modulo);
        return ResponseEntity.ok(convertToDTO(savedModulo));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> updateModulo(@PathVariable Long id, @RequestBody Map<String, Object> moduloData) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
        
        modulo.setTitulo((String) moduloData.get("titulo"));
        if (moduloData.containsKey("orden")) {
            modulo.setOrden((Integer) moduloData.get("orden"));
        }
        
        Modulo updatedModulo = moduloRepository.save(modulo);
        return ResponseEntity.ok(convertToDTO(updatedModulo));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteModulo(@PathVariable Long id) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
        
        moduloRepository.delete(modulo);
        return ResponseEntity.ok().build();
    }

    private Map<String, Object> convertToDTO(Modulo modulo) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", modulo.getId());
        dto.put("titulo", modulo.getTitulo());
        dto.put("orden", modulo.getOrden());
        dto.put("activo", modulo.getActivo());
        dto.put("cursoId", modulo.getCurso().getId());
        
        // Cargar submódulos
        List<Submodulo> submodulos = submoduloRepository.findByModuloOrderByOrdenAsc(modulo);
        List<Map<String, Object>> submodulosDTO = submodulos.stream()
                .map(this::convertSubmoduloToDTO)
                .collect(Collectors.toList());
        
        dto.put("submodulos", submodulosDTO);
        
        return dto;
    }
    
    private Map<String, Object> convertSubmoduloToDTO(Submodulo submodulo) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", submodulo.getId());
        dto.put("titulo", submodulo.getTitulo());
        dto.put("contenido", submodulo.getContenido());
        dto.put("tipo", submodulo.getTipo().toLowerCase());
        dto.put("orden", submodulo.getOrden());
        
        // Información del archivo si existe
        if (submodulo.getNombreArchivo() != null) {
            Map<String, Object> archivo = new HashMap<>();
            archivo.put("name", submodulo.getNombreArchivo());
            archivo.put("filename", submodulo.getRutaArchivo());
            archivo.put("contentType", submodulo.getTipoMime());
            archivo.put("size", submodulo.getTamanioArchivo());
            archivo.put("url", baseUrl + "/api/files/preview/" + submodulo.getRutaArchivo());
            archivo.put("downloadUrl", baseUrl + "/api/files/download/" + submodulo.getRutaArchivo());
            dto.put("archivo", archivo);
        }
        
        return dto;
    }
}
