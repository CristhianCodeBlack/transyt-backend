package com.capacitapro.backend.controller;

import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import com.capacitapro.backend.service.CapacitacionEnVivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/capacitaciones-vivo")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "https://transyt-frontend.onrender.com"})
public class CapacitacionEnVivoController {

    private final CapacitacionEnVivoService capacitacionService;
    private final CapacitacionEnVivoRepository capacitacionRepo;
    private final UsuarioRepository usuarioRepo;
    private final CursoRepository cursoRepo;

    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepo.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<Map<String, Object>>> getCapacitaciones(
            @PathVariable Long empresaId,
            Authentication authentication) {
        
        try {
            List<CapacitacionEnVivo> capacitaciones = capacitacionRepo.findAll().stream()
                    .filter(c -> c.getCurso().getEmpresa().getId().equals(empresaId))
                    .sorted((c1, c2) -> c2.getFechaInicio().compareTo(c1.getFechaInicio()))
                    .collect(Collectors.toList());
            
            List<Map<String, Object>> resultado = capacitaciones.stream().map(capacitacion -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", capacitacion.getId());
                item.put("titulo", capacitacion.getTitulo());
                item.put("descripcion", capacitacion.getDescripcion());
                item.put("fechaInicio", capacitacion.getFechaInicio());
                item.put("fechaFin", capacitacion.getFechaFin());
                item.put("enlaceTeams", capacitacion.getEnlaceTeams());
                item.put("meetingId", capacitacion.getMeetingId());
                item.put("creador", capacitacion.getCreador().getNombre());
                item.put("activo", capacitacion.getActivo());
                item.put("curso", capacitacion.getCurso().getTitulo());
                item.put("cursoId", capacitacion.getCurso().getId());
                
                return item;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo capacitaciones: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<String> crearCapacitacion(
            @RequestBody Map<String, Object> data,
            Authentication authentication) {
        
        try {
            System.out.println("=== CREANDO CAPACITACIÓN ===");
            System.out.println("Datos recibidos: " + data);
            System.out.println("Authentication: " + (authentication != null ? authentication.getName() : "null"));
            
            Usuario creador = getUsuarioAutenticado(authentication);
            System.out.println("Usuario creador: " + creador.getNombre() + ", Rol: " + creador.getRol());
            
            if (!creador.getRol().equals("ADMIN") && !creador.getRol().equals("INSTRUCTOR")) {
                return ResponseEntity.status(403).body("No tiene permisos para crear capacitaciones");
            }
            
            String titulo = (String) data.get("titulo");
            String descripcion = (String) data.get("descripcion");
            String fechaInicioStr = (String) data.get("fechaInicio");
            String fechaFinStr = (String) data.get("fechaFin");
            Long cursoId;
            Object cursoIdObj = data.get("cursoId");
            if (cursoIdObj instanceof String) {
                cursoId = Long.parseLong((String) cursoIdObj);
            } else {
                cursoId = ((Number) cursoIdObj).longValue();
            }
            
            LocalDateTime fechaInicio = LocalDateTime.parse(fechaInicioStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            LocalDateTime fechaFin = LocalDateTime.parse(fechaFinStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            
            Curso curso = cursoRepo.findById(cursoId)
                    .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
            
            CapacitacionEnVivo capacitacion = CapacitacionEnVivo.builder()
                    .titulo(titulo)
                    .descripcion(descripcion)
                    .fechaInicio(fechaInicio)
                    .fechaFin(fechaFin)
                    .creador(creador)
                    .curso(curso)
                    .activo(true)
                    .build();
            
            // Intentar crear con Teams, si falla usar enlace demo
            CapacitacionEnVivo nuevaCapacitacion;
            try {
                nuevaCapacitacion = capacitacionService.crearConTeams(capacitacion);
                System.out.println("Capacitación creada con Teams: " + nuevaCapacitacion.getEnlaceTeams());
            } catch (Exception teamsError) {
                System.err.println("Error creando con Teams: " + teamsError.getMessage());
                // Fallback: crear sin Teams
                capacitacion.setEnlaceTeams("https://teams.microsoft.com/l/meetup-join/demo-" + System.currentTimeMillis());
                capacitacion.setMeetingId("DEMO-" + System.currentTimeMillis());
                nuevaCapacitacion = capacitacionRepo.save(capacitacion);
                System.out.println("Capacitación creada sin Teams (fallback): " + nuevaCapacitacion.getId());
            }
            
            return ResponseEntity.ok("Capacitación creada exitosamente. Link: " + nuevaCapacitacion.getEnlaceTeams());
            
        } catch (Exception e) {
            System.err.println("Error creando capacitación: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
