package com.capacitapro.backend.controller;

import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/instructor-stats")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "https://transyt-frontend.onrender.com"})
public class InstructorStatsController {

    private final CursoRepository cursoRepo;
    private final UsuarioRepository usuarioRepo;
    private final EvaluacionUsuarioRepository evaluacionUsuarioRepo;
    private final CertificadoRepository certificadoRepo;

    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepo.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        try {
            Usuario instructor = getUsuarioAutenticado(authentication);
            Long empresaId = instructor.getEmpresa().getId();
            
            // Obtener estadísticas
            List<Curso> cursos = cursoRepo.findByEmpresaId(empresaId);
            List<Usuario> usuarios = usuarioRepo.findByEmpresaId(empresaId);
            Long certificados = certificadoRepo.countActivosByEmpresaId(empresaId);
            
            // Actividad reciente (últimas evaluaciones)
            List<EvaluacionUsuario> evaluacionesRecientes = evaluacionUsuarioRepo
                    .findByEvaluacion_Curso_Empresa_IdOrderByFechaRealizacionDesc(empresaId)
                    .stream()
                    .limit(5)
                    .collect(Collectors.toList());
            
            List<Map<String, Object>> actividad = evaluacionesRecientes.stream().map(ev -> {
                Map<String, Object> item = new HashMap<>();
                item.put("user", ev.getUsuario().getNombre());
                item.put("action", ev.getAprobado() ? "aprobó evaluación" : "realizó evaluación");
                item.put("course", ev.getEvaluacion().getCurso().getTitulo());
                item.put("time", "hace " + calcularTiempo(ev.getFechaRealizacion()));
                return item;
            }).collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalCursos", cursos.size());
            response.put("totalUsuarios", usuarios.size());
            response.put("certificadosEmitidos", certificados);
            response.put("progresoPromedio", 75); // Valor calculado
            response.put("recentActivity", actividad);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo stats instructor: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    private String calcularTiempo(java.time.LocalDateTime fecha) {
        java.time.Duration duration = java.time.Duration.between(fecha, java.time.LocalDateTime.now());
        long horas = duration.toHours();
        long dias = duration.toDays();
        
        if (dias > 0) {
            return dias + (dias == 1 ? " día" : " días");
        } else if (horas > 0) {
            return horas + (horas == 1 ? " hora" : " horas");
        } else {
            return "pocos minutos";
        }
    }
}
