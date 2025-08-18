package com.capacitapro.backend.controller;

import com.capacitapro.backend.entity.Evento;
import com.capacitapro.backend.entity.Usuario;
import com.capacitapro.backend.entity.InscripcionEvento;
import com.capacitapro.backend.repository.EventoRepository;
import com.capacitapro.backend.repository.UsuarioRepository;
import com.capacitapro.backend.repository.InscripcionEventoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class EventoController {

    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionEventoRepository inscripcionRepository;

    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @GetMapping
    public ResponseEntity<List<Evento>> getAllEventos() {
        List<Evento> eventos = eventoRepository.findAll();
        return ResponseEntity.ok(eventos);
    }

    @GetMapping("/proximos")
    public ResponseEntity<List<Evento>> getEventosProximos() {
        List<Evento> eventos = eventoRepository.findEventosProximos(LocalDateTime.now());
        return ResponseEntity.ok(eventos.stream().limit(5).toList());
    }

    @GetMapping("/mes/{year}/{month}")
    public ResponseEntity<List<Evento>> getEventosPorMes(
            @PathVariable int year, 
            @PathVariable int month) {
        List<Evento> eventos = eventoRepository.findEventosPorMes(year, month);
        return ResponseEntity.ok(eventos);
    }

    @PostMapping
    public ResponseEntity<Evento> crearEvento(@RequestBody Evento evento, Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            if (!"ADMIN".equals(usuario.getRol()) && !"INSTRUCTOR".equals(usuario.getRol())) {
                return ResponseEntity.status(403).build();
            }
            
            evento.setCreadoPor(usuario);
            evento.setFechaCreacion(LocalDateTime.now());
            
            Evento eventoGuardado = eventoRepository.save(evento);
            return ResponseEntity.ok(eventoGuardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evento> actualizarEvento(
            @PathVariable Long id, 
            @RequestBody Evento eventoActualizado,
            Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            if (!"ADMIN".equals(usuario.getRol()) && !"INSTRUCTOR".equals(usuario.getRol())) {
                return ResponseEntity.status(403).build();
            }
            
            return eventoRepository.findById(id)
                    .map(evento -> {
                        evento.setTitulo(eventoActualizado.getTitulo());
                        evento.setDescripcion(eventoActualizado.getDescripcion());
                        evento.setFechaInicio(eventoActualizado.getFechaInicio());
                        evento.setFechaFin(eventoActualizado.getFechaFin());
                        evento.setUbicacion(eventoActualizado.getUbicacion());
                        evento.setInstructor(eventoActualizado.getInstructor());
                        evento.setMaxAsistentes(eventoActualizado.getMaxAsistentes());
                        evento.setTipo(eventoActualizado.getTipo());
                        evento.setEstado(eventoActualizado.getEstado());
                        evento.setEnlaceVirtual(eventoActualizado.getEnlaceVirtual());
                        
                        return ResponseEntity.ok(eventoRepository.save(evento));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEvento(@PathVariable Long id, Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            if (!"ADMIN".equals(usuario.getRol())) {
                return ResponseEntity.status(403).build();
            }
            
            if (eventoRepository.existsById(id)) {
                eventoRepository.deleteById(id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/inscribir")
    public ResponseEntity<Map<String, String>> inscribirseEvento(
            @PathVariable Long id, 
            Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            return eventoRepository.findById(id)
                    .map(evento -> {
                        // Verificar si ya está inscrito
                        if (inscripcionRepository.existsByEventoAndUsuario(evento, usuario)) {
                            Map<String, String> response = new HashMap<>();
                            response.put("message", "Ya estás inscrito en este evento");
                            return ResponseEntity.badRequest().body(response);
                        }
                        
                        // Verificar cupo
                        long inscritosAprobados = inscripcionRepository.countApprovedByEvento(evento);
                        if (inscritosAprobados >= evento.getMaxAsistentes()) {
                            Map<String, String> response = new HashMap<>();
                            response.put("message", "Evento lleno");
                            return ResponseEntity.badRequest().body(response);
                        }
                        
                        // Crear inscripción
                        InscripcionEvento inscripcion = new InscripcionEvento();
                        inscripcion.setEvento(evento);
                        inscripcion.setUsuario(usuario);
                        inscripcion.setEstado(InscripcionEvento.EstadoInscripcion.PENDIENTE);
                        inscripcionRepository.save(inscripcion);
                        
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Inscripción enviada, pendiente de aprobación");
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error en la inscripción");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/{id}/inscripciones")
    public ResponseEntity<List<InscripcionEvento>> getInscripcionesEvento(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            if (!"ADMIN".equals(usuario.getRol()) && !"INSTRUCTOR".equals(usuario.getRol())) {
                return ResponseEntity.status(403).build();
            }
            
            return eventoRepository.findById(id)
                    .map(evento -> {
                        List<InscripcionEvento> inscripciones = inscripcionRepository.findByEventoOrderByFechaInscripcion(evento);
                        return ResponseEntity.ok(inscripciones);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/inscripciones/{inscripcionId}/aprobar")
    public ResponseEntity<Map<String, String>> aprobarInscripcion(
            @PathVariable Long inscripcionId,
            Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            if (!"ADMIN".equals(usuario.getRol()) && !"INSTRUCTOR".equals(usuario.getRol())) {
                return ResponseEntity.status(403).build();
            }
            
            return inscripcionRepository.findById(inscripcionId)
                    .map(inscripcion -> {
                        inscripcion.setEstado(InscripcionEvento.EstadoInscripcion.APROBADA);
                        inscripcion.setAprobadoPor(usuario);
                        inscripcion.setFechaAprobacion(LocalDateTime.now());
                        inscripcionRepository.save(inscripcion);
                        
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Inscripción aprobada");
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al aprobar inscripción");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PutMapping("/inscripciones/{inscripcionId}/rechazar")
    public ResponseEntity<Map<String, String>> rechazarInscripcion(
            @PathVariable Long inscripcionId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            if (!"ADMIN".equals(usuario.getRol()) && !"INSTRUCTOR".equals(usuario.getRol())) {
                return ResponseEntity.status(403).build();
            }
            
            return inscripcionRepository.findById(inscripcionId)
                    .map(inscripcion -> {
                        inscripcion.setEstado(InscripcionEvento.EstadoInscripcion.RECHAZADA);
                        inscripcion.setAprobadoPor(usuario);
                        inscripcion.setComentarios(body.get("comentarios"));
                        inscripcionRepository.save(inscripcion);
                        
                        Map<String, String> response = new HashMap<>();
                        response.put("message", "Inscripción rechazada");
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error al rechazar inscripción");
            return ResponseEntity.badRequest().body(response);
        }
    }
}