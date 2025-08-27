package com.capacitapro.backend.controller;

import com.capacitapro.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "https://transyt-frontend.onrender.com"})
public class DashboardController {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final CertificadoRepository certificadoRepository;
    private final CursoUsuarioRepository cursoUsuarioRepository;

    @GetMapping("/admin/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> testAdmin() {
        return ResponseEntity.ok("Admin access OK");
    }
    
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Contar usuarios totales
        long totalUsuarios = usuarioRepository.count();
        
        // Contar cursos activos
        long totalCursos = cursoRepository.countByActivoTrue();
        
        // Contar certificados emitidos
        long certificadosEmitidos = certificadoRepository.count();
        
        // Calcular progreso promedio (simplificado)
        Double progresoPromedio = cursoUsuarioRepository.findAverageProgreso();
        if (progresoPromedio == null) {
            progresoPromedio = 0.0;
        }
        
        stats.put("totalUsuarios", totalUsuarios);
        stats.put("totalCursos", totalCursos);
        stats.put("certificadosEmitidos", certificadosEmitidos);
        stats.put("progresoPromedio", Math.round(progresoPromedio));
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/instructor/stats")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Map<String, Object>> getInstructorStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // TODO: Implementar estadísticas específicas para instructor
        stats.put("misCursos", 0);
        stats.put("estudiantesActivos", 0);
        stats.put("certificadosEmitidos", 0);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/empleado/stats")
    @PreAuthorize("hasRole('EMPLEADO')")
    public ResponseEntity<Map<String, Object>> getEmpleadoStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // TODO: Implementar estadísticas específicas para empleado
        stats.put("cursosAsignados", 0);
        stats.put("cursosCompletados", 0);
        stats.put("certificadosObtenidos", 0);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/recent-activity")
    public ResponseEntity<java.util.List<Map<String, Object>>> getRecentActivity() {
        try {
            java.util.List<Map<String, Object>> activities = new java.util.ArrayList<>();
            
            // Obtener últimos certificados emitidos
            try {
                certificadoRepository.findTop5ByOrderByFechaGeneracionDesc().forEach(cert -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("user", cert.getUsuario().getNombre());
                    activity.put("action", "obtuvo certificado en");
                    activity.put("course", cert.getCurso().getTitulo());
                    activity.put("time", "hace " + getTimeAgo(cert.getFechaGeneracion()));
                    activities.add(activity);
                });
            } catch (Exception e) {
                System.err.println("Error obteniendo certificados: " + e.getMessage());
            }
            
            // Obtener últimas inscripciones
            try {
                cursoUsuarioRepository.findTop5ByOrderByFechaAsignacionDesc().forEach(cu -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("user", cu.getUsuario().getNombre());
                    activity.put("action", cu.getCompletado() ? "completó el curso" : "se inscribió en");
                    activity.put("course", cu.getCurso().getTitulo());
                    activity.put("time", "hace " + getTimeAgo(cu.getFechaAsignacion()));
                    activities.add(activity);
                });
            } catch (Exception e) {
                System.err.println("Error obteniendo inscripciones: " + e.getMessage());
            }
            
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            System.err.println("Error en getRecentActivity: " + e.getMessage());
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
    
    private String getTimeAgo(java.time.LocalDateTime dateTime) {
        if (dateTime == null) return "un tiempo";
        
        java.time.Duration duration = java.time.Duration.between(dateTime, java.time.LocalDateTime.now());
        long hours = duration.toHours();
        long days = duration.toDays();
        
        if (days > 0) {
            return days + (days == 1 ? " día" : " días");
        } else if (hours > 0) {
            return hours + (hours == 1 ? " hora" : " horas");
        } else {
            return "unos minutos";
        }
    }
}
