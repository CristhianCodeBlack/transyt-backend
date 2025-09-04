package com.capacitapro.backend.controller;

import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seguimiento-tests")
@RequiredArgsConstructor

public class SeguimientoTestController {

    private final EvaluacionUsuarioRepository evaluacionUsuarioRepo;
    private final RespuestaUsuarioTextoRepository respuestaTextoRepo;
    private final UsuarioRepository usuarioRepo;
    private final CursoRepository cursoRepo;

    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepo.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<Map<String, Object>>> getSeguimientoPorEmpresa(
            @PathVariable Long empresaId,
            Authentication authentication) {
        
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            // Verificar permisos (admin o instructor)
            if (!usuario.getRol().equals("ADMIN") && !usuario.getRol().equals("INSTRUCTOR")) {
                return ResponseEntity.status(403).build();
            }
            
            List<EvaluacionUsuario> evaluaciones = evaluacionUsuarioRepo
                    .findByEvaluacion_Curso_Empresa_IdOrderByFechaRealizacionDesc(empresaId);
            
            List<Map<String, Object>> resultado = evaluaciones.stream().map(ev -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", ev.getId());
                item.put("usuario", ev.getUsuario().getNombre());
                item.put("correoUsuario", ev.getUsuario().getCorreo());
                item.put("curso", ev.getEvaluacion().getCurso().getTitulo());
                item.put("test", ev.getEvaluacion().getTitulo());
                item.put("puntajeObtenido", ev.getPuntajeObtenido());
                item.put("puntajeMaximo", ev.getPuntajeMaximo());
                item.put("aprobado", ev.getAprobado());
                item.put("fechaRealizacion", ev.getFechaRealizacion());
                item.put("intentos", ev.getIntentos());
                
                // Verificar si tiene respuestas de texto pendientes
                List<RespuestaUsuarioTexto> respuestasTexto = respuestaTextoRepo.findByEvaluacionUsuario(ev);
                long pendientes = respuestasTexto.stream().filter(r -> !r.getRevisada()).count();
                item.put("respuestasPendientes", pendientes);
                
                return item;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo seguimiento: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/respuestas-pendientes/{empresaId}")
    public ResponseEntity<List<Map<String, Object>>> getRespuestasPendientes(
            @PathVariable Long empresaId,
            Authentication authentication) {
        
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            List<RespuestaUsuarioTexto> pendientes = respuestaTextoRepo.findPendientesByEmpresa(empresaId);
            
            List<Map<String, Object>> resultado = pendientes.stream().map(resp -> {
                Map<String, Object> item = new HashMap<>();
                item.put("id", resp.getId());
                item.put("usuario", resp.getEvaluacionUsuario().getUsuario().getNombre());
                item.put("curso", resp.getEvaluacionUsuario().getEvaluacion().getCurso().getTitulo());
                item.put("test", resp.getEvaluacionUsuario().getEvaluacion().getTitulo());
                item.put("pregunta", resp.getPregunta().getEnunciado());
                item.put("respuestaTexto", resp.getRespuestaTexto());
                item.put("puntajeMaximo", resp.getPregunta().getPuntaje());
                item.put("fechaRespuesta", resp.getFechaRespuesta());
                item.put("respuestaEsperada", resp.getPregunta().getRespuestaEsperada());
                return item;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo respuestas pendientes: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/calificar-respuesta/{respuestaId}")
    public ResponseEntity<String> calificarRespuesta(
            @PathVariable Long respuestaId,
            @RequestBody Map<String, Object> data,
            Authentication authentication) {
        
        try {
            Usuario revisor = getUsuarioAutenticado(authentication);
            
            RespuestaUsuarioTexto respuesta = respuestaTextoRepo.findById(respuestaId)
                    .orElseThrow(() -> new RuntimeException("Respuesta no encontrada"));
            
            Integer puntaje = (Integer) data.get("puntaje");
            String comentario = (String) data.get("comentario");
            
            respuesta.setPuntajeAsignado(puntaje);
            respuesta.setComentarioInstructor(comentario);
            respuesta.setRevisada(true);
            respuesta.setFechaRevision(LocalDateTime.now());
            respuesta.setRevisor(revisor);
            
            respuestaTextoRepo.save(respuesta);
            
            // Recalcular puntaje total de la evaluación
            recalcularPuntajeEvaluacion(respuesta.getEvaluacionUsuario());
            
            return ResponseEntity.ok("Respuesta calificada exitosamente");
            
        } catch (Exception e) {
            System.err.println("Error calificando respuesta: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    private void recalcularPuntajeEvaluacion(EvaluacionUsuario evaluacionUsuario) {
        // Obtener todas las respuestas de texto para esta evaluación
        List<RespuestaUsuarioTexto> respuestasTexto = respuestaTextoRepo.findByEvaluacionUsuario(evaluacionUsuario);
        
        // Sumar puntajes de respuestas de texto revisadas
        int puntajeTexto = respuestasTexto.stream()
                .filter(RespuestaUsuarioTexto::getRevisada)
                .mapToInt(RespuestaUsuarioTexto::getPuntajeAsignado)
                .sum();
        
        // Aquí deberías sumar también el puntaje de preguntas de opción múltiple
        // Por simplicidad, asumimos que ya está calculado
        
        evaluacionUsuario.setPuntajeObtenido(evaluacionUsuario.getPuntajeObtenido() + puntajeTexto);
        evaluacionUsuario.calcularAprobacion();
        
        evaluacionUsuarioRepo.save(evaluacionUsuario);
    }
}
