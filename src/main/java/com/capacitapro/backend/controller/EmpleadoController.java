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
@RequestMapping("/api/empleado")
@RequiredArgsConstructor

public class EmpleadoController {

    private final UsuarioRepository usuarioRepo;
    private final CursoUsuarioRepository cursoUsuarioRepo;
    private final CertificadoRepository certificadoRepo;
    private final EvaluacionUsuarioRepository evaluacionUsuarioRepo;
    private final CapacitacionEnVivoRepository capacitacionRepo;

    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepo.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            Map<String, Object> response = new HashMap<>();
            response.put("cursosAsignados", 0);
            response.put("cursosCompletados", 0);
            response.put("certificadosObtenidos", 0);
            response.put("evaluacionesAprobadas", 0);
            response.put("progresoGeneral", 0);
            response.put("cursosRecientes", new ArrayList<>());
            response.put("capacitacionesProximas", new ArrayList<>());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo dashboard empleado: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    @GetMapping("/notificaciones")
    public ResponseEntity<List<Map<String, Object>>> getNotificaciones(Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            List<Map<String, Object>> notificaciones = new ArrayList<>();
            
            // Nuevos cursos asignados
            List<CursoUsuario> cursosRecientes = cursoUsuarioRepo.findByUsuario(usuario).stream()
                    .filter(cu -> cu.getFechaAsignacion().isAfter(
                        java.time.LocalDateTime.now().minusDays(7)))
                    .collect(Collectors.toList());
            
            for (CursoUsuario cu : cursosRecientes) {
                Map<String, Object> notif = new HashMap<>();
                notif.put("tipo", "curso_asignado");
                notif.put("titulo", "Nuevo curso asignado");
                notif.put("mensaje", "Se te ha asignado el curso: " + cu.getCurso().getTitulo());
                notif.put("fecha", cu.getFechaAsignacion());
                notificaciones.add(notif);
            }
            
            // Certificados obtenidos recientemente
            List<Certificado> certificadosRecientes = certificadoRepo
                    .findByUsuarioAndActivoTrueOrderByFechaGeneracionDesc(usuario).stream()
                    .filter(cert -> cert.getFechaGeneracion().isAfter(
                        java.time.LocalDateTime.now().minusDays(7)))
                    .collect(Collectors.toList());
            
            for (Certificado cert : certificadosRecientes) {
                Map<String, Object> notif = new HashMap<>();
                notif.put("tipo", "certificado_obtenido");
                notif.put("titulo", "¡Certificado obtenido!");
                notif.put("mensaje", "Has obtenido el certificado del curso: " + cert.getCurso().getTitulo());
                notif.put("fecha", cert.getFechaGeneracion());
                notificaciones.add(notif);
            }
            
            // Ordenar por fecha más reciente
            notificaciones.sort((n1, n2) -> 
                ((java.time.LocalDateTime) n2.get("fecha"))
                .compareTo((java.time.LocalDateTime) n1.get("fecha")));
            
            return ResponseEntity.ok(notificaciones.stream().limit(5).collect(Collectors.toList()));
            
        } catch (Exception e) {
            System.err.println("Error obteniendo notificaciones: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
