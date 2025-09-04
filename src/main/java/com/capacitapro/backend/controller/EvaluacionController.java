package com.capacitapro.backend.controller;

import com.capacitapro.backend.dto.*;
import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import com.capacitapro.backend.service.EvaluacionService;
import com.capacitapro.backend.service.CertificadoService;
import com.capacitapro.backend.service.ProgresoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/evaluaciones")
@RequiredArgsConstructor

public class EvaluacionController {

    private final EvaluacionService evaluacionService;
    private final UsuarioRepository usuarioRepository;
    private final EvaluacionRepository evaluacionRepo;
    private final CursoRepository cursoRepo;
    private final ModuloRepository moduloRepo;
    private final PreguntaRepository preguntaRepo;
    private final RespuestaRepository respuestaRepo;
    private final EvaluacionUsuarioRepository evaluacionUsuarioRepo;
    private final CertificadoService certificadoService;
    private final ProgresoService progresoService;

    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<EvaluacionDTO>> listarPorCurso(
            @PathVariable Long cursoId, 
            Authentication authentication
    ) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            return ResponseEntity.ok(evaluacionService.listarPorCurso(cursoId, usuario));
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }
    
    @GetMapping("/modulo/{moduloId}")
    public ResponseEntity<List<EvaluacionDTO>> listarPorModulo(@PathVariable Long moduloId) {
        try {
            System.out.println("=== BUSCANDO EVALUACIONES PARA MÓDULO " + moduloId + " ===");
            
            // Buscar evaluaciones del módulo
            List<Evaluacion> evaluacionesModulo = evaluacionRepo.findByModuloIdAndActivoTrue(moduloId);
            System.out.println("Evaluaciones del módulo: " + evaluacionesModulo.size());
            
            // Buscar evaluaciones del curso (ya que aparecen como submódulos)
            List<Evaluacion> evaluacionesCurso = new java.util.ArrayList<>();
            try {
                // Obtener el curso del módulo
                Optional<Modulo> moduloOpt = moduloRepo.findById(moduloId);
                if (moduloOpt.isPresent()) {
                    Long cursoId = moduloOpt.get().getCurso().getId();
                    evaluacionesCurso = evaluacionRepo.findActivasByCursoId(cursoId);
                    System.out.println("Evaluaciones del curso " + cursoId + ": " + evaluacionesCurso.size());
                }
            } catch (Exception e) {
                System.err.println("Error obteniendo evaluaciones del curso: " + e.getMessage());
            }
            
            // Combinar ambas listas evitando duplicados
            List<Evaluacion> todasEvaluaciones = new java.util.ArrayList<>(evaluacionesModulo);
            for (Evaluacion evalCurso : evaluacionesCurso) {
                if (!todasEvaluaciones.stream().anyMatch(e -> e.getId().equals(evalCurso.getId()))) {
                    todasEvaluaciones.add(evalCurso);
                }
            }
            
            System.out.println("Total evaluaciones encontradas: " + todasEvaluaciones.size());
            
            List<EvaluacionDTO> evaluacionesDTO = new java.util.ArrayList<>();
            
            for (Evaluacion eval : todasEvaluaciones) {
                System.out.println("Procesando evaluación: " + eval.getId() + " - " + eval.getTitulo());
                EvaluacionDTO dto = new EvaluacionDTO();
                dto.setId(eval.getId());
                dto.setTitulo(eval.getTitulo());
                dto.setDescripcion(eval.getDescripcion());
                dto.setNotaMinima(eval.getNotaMinima());
                
                // Cargar preguntas
                List<PreguntaDTO> preguntasDTO = new java.util.ArrayList<>();
                for (Pregunta pregunta : eval.getPreguntas()) {
                    PreguntaDTO preguntaDTO = new PreguntaDTO();
                    preguntaDTO.setId(pregunta.getId());
                    preguntaDTO.setEnunciado(pregunta.getEnunciado());
                    preguntaDTO.setPuntaje(pregunta.getPuntaje());
                    preguntaDTO.setTipo(pregunta.getTipo());
                    
                    // Cargar respuestas
                    List<RespuestaDTO> respuestasDTO = new java.util.ArrayList<>();
                    for (Respuesta respuesta : pregunta.getRespuestas()) {
                        RespuestaDTO respuestaDTO = new RespuestaDTO();
                        respuestaDTO.setId(respuesta.getId());
                        respuestaDTO.setTexto(respuesta.getTexto());
                        respuestaDTO.setEsCorrecta(respuesta.getEsCorrecta());
                        respuestasDTO.add(respuestaDTO);
                    }
                    preguntaDTO.setRespuestas(respuestasDTO);
                    preguntasDTO.add(preguntaDTO);
                }
                dto.setPreguntas(preguntasDTO);
                evaluacionesDTO.add(dto);
            }
            
            return ResponseEntity.ok(evaluacionesDTO);
        } catch (Exception e) {
            System.err.println("Error obteniendo evaluaciones por módulo: " + e.getMessage());
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluacionDTO> obtenerEvaluacion(@PathVariable Long id, Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            EvaluacionDTO evaluacion = evaluacionService.obtenerPorId(id, usuario);
            return ResponseEntity.ok(evaluacion);
        } catch (Exception e) {
            System.err.println("Error obteniendo evaluación: " + e.getMessage());
            // Intentar obtener sin validación para empleados
            try {
                EvaluacionDTO evaluacion = evaluacionService.obtenerPorIdSinValidacion(id);
                return ResponseEntity.ok(evaluacion);
            } catch (Exception ex) {
                return ResponseEntity.notFound().build();
            }
        }
    }

    @PostMapping
    public ResponseEntity<EvaluacionDTO> crearEvaluacion(
            @Valid @RequestBody EvaluacionDTO evaluacionDTO, 
            Authentication authentication
    ) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            EvaluacionDTO nuevaEvaluacion = evaluacionService.crearEvaluacion(evaluacionDTO, usuario);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEvaluacion);
        } catch (Exception e) {
            System.err.println("Error al crear evaluación: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @PostMapping("/actualizar-preguntas")
    @Transactional
    public ResponseEntity<String> actualizarPreguntasTest(@RequestBody Map<String, Object> data) {
        try {
            System.out.println("=== ACTUALIZANDO PREGUNTAS ===");
            System.out.println("Data: " + data);
            
            Long evaluacionId = ((Number) data.get("id")).longValue();
            Evaluacion evaluacion = evaluacionRepo.findById(evaluacionId)
                    .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
            
            System.out.println("Evaluación encontrada: " + evaluacion.getTitulo());
            
            // Eliminar preguntas existentes
            List<Pregunta> preguntasExistentes = preguntaRepo.findByEvaluacion(evaluacion);
            for (Pregunta p : preguntasExistentes) {
                respuestaRepo.deleteByPregunta(p);
                preguntaRepo.delete(p);
            }
            System.out.println("Preguntas existentes eliminadas: " + preguntasExistentes.size());
            
            // Agregar nuevas preguntas
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> preguntas = (List<Map<String, Object>>) data.get("preguntas");
            
            if (preguntas != null) {
                for (Map<String, Object> p : preguntas) {
                    String enunciado = (String) p.get("enunciado");
                    
                    if (enunciado == null || enunciado.trim().length() < 10) {
                        continue;
                    }
                    
                    Pregunta pregunta = new Pregunta();
                    pregunta.setEnunciado(enunciado.trim());
                    pregunta.setPuntaje(((Number) p.getOrDefault("puntaje", 1)).intValue());
                    pregunta.setTipo((String) p.getOrDefault("tipo", "multiple"));
                    pregunta.setRespuestaEsperada((String) p.get("respuestaEsperada"));
                    pregunta.setEvaluacion(evaluacion);
                    
                    pregunta = preguntaRepo.save(pregunta);
                    System.out.println("Nueva pregunta guardada: " + pregunta.getId());
                    
                    // Guardar respuestas
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> respuestas = (List<Map<String, Object>>) p.get("respuestas");
                    
                    if (respuestas != null) {
                        for (Map<String, Object> r : respuestas) {
                            Respuesta respuesta = new Respuesta();
                            respuesta.setTexto((String) r.get("texto"));
                            respuesta.setEsCorrecta((Boolean) r.getOrDefault("esCorrecta", false));
                            respuesta.setPregunta(pregunta);
                            
                            respuestaRepo.save(respuesta);
                        }
                    }
                }
            }
            
            return ResponseEntity.ok("Preguntas actualizadas exitosamente para evaluación: " + evaluacionId);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/simple")
    public ResponseEntity<String> crearTestSimple(
            @RequestBody Map<String, Object> data,
            Authentication authentication) {
        try {
            System.out.println("=== CREANDO TEST SIMPLE ===");
            System.out.println("Data completa recibida: " + data);
            System.out.println("Titulo: " + data.get("titulo"));
            System.out.println("Descripcion: " + data.get("descripcion"));
            System.out.println("CursoId: " + data.get("cursoId"));
            System.out.println("ModuloId: " + data.get("moduloId"));
            System.out.println("NotaMinima: " + data.get("notaMinima"));
            
            // Crear evaluación directamente
            Evaluacion evaluacion = new Evaluacion();
            evaluacion.setTitulo((String) data.get("titulo"));
            evaluacion.setDescripcion((String) data.get("descripcion"));
            evaluacion.setNotaMinima((Integer) data.getOrDefault("notaMinima", 70));
            evaluacion.setActivo(true);
            
            // Buscar curso
            Long cursoId = ((Number) data.get("cursoId")).longValue();
            Curso curso = cursoRepo.findById(cursoId).orElseThrow();
            evaluacion.setCurso(curso);
            
            evaluacion = evaluacionRepo.save(evaluacion);
            System.out.println("Evaluación guardada: " + evaluacion.getId());
            
            // Guardar preguntas
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> preguntas = (List<Map<String, Object>>) data.get("preguntas");
            
            System.out.println("Preguntas recibidas: " + preguntas);
            System.out.println("Número de preguntas: " + (preguntas != null ? preguntas.size() : 0));
            
            if (preguntas != null) {
                int preguntaIndex = 0;
                for (Map<String, Object> p : preguntas) {
                    preguntaIndex++;
                    System.out.println("=== PROCESANDO PREGUNTA " + preguntaIndex + " ===");
                    System.out.println("Pregunta data: " + p);
                    
                    String enunciado = (String) p.get("enunciado");
                    System.out.println("Enunciado: " + enunciado);
                    System.out.println("Puntaje: " + p.get("puntaje"));
                    System.out.println("Tipo: " + p.get("tipo"));
                    
                    // Saltar preguntas sin enunciado o muy cortas
                    if (enunciado == null || enunciado.trim().length() < 10) {
                        System.out.println("SALTANDO pregunta con enunciado inválido: " + enunciado);
                        System.out.println("Longitud del enunciado: " + (enunciado != null ? enunciado.trim().length() : 0));
                        continue;
                    }
                    
                    Pregunta pregunta = new Pregunta();
                    pregunta.setEnunciado(enunciado.trim());
                    pregunta.setPuntaje(((Number) p.getOrDefault("puntaje", 1)).intValue());
                    pregunta.setTipo((String) p.getOrDefault("tipo", "multiple"));
                    pregunta.setRespuestaEsperada((String) p.get("respuestaEsperada"));
                    pregunta.setEvaluacion(evaluacion);
                    
                    pregunta = preguntaRepo.save(pregunta);
                    System.out.println("Pregunta guardada: " + pregunta.getId());
                    
                    // Guardar respuestas
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> respuestas = (List<Map<String, Object>>) p.get("respuestas");
                    
                    System.out.println("Respuestas para pregunta " + pregunta.getId() + ": " + respuestas);
                    System.out.println("Número de respuestas: " + (respuestas != null ? respuestas.size() : 0));
                    
                    if (respuestas != null) {
                        int respuestaIndex = 0;
                        for (Map<String, Object> r : respuestas) {
                            respuestaIndex++;
                            System.out.println("Respuesta " + respuestaIndex + ": " + r);
                            
                            Respuesta respuesta = new Respuesta();
                            respuesta.setTexto((String) r.get("texto"));
                            respuesta.setEsCorrecta((Boolean) r.getOrDefault("esCorrecta", false));
                            respuesta.setPregunta(pregunta);
                            
                            Respuesta respuestaGuardada = respuestaRepo.save(respuesta);
                            System.out.println("Respuesta guardada ID: " + respuestaGuardada.getId());
                            System.out.println("Respuesta texto: " + respuestaGuardada.getTexto());
                            System.out.println("Es correcta: " + respuestaGuardada.getEsCorrecta());
                        }
                    } else {
                        System.out.println("WARNING: No hay respuestas para la pregunta " + pregunta.getId());
                    }
                }
            }
            
            return ResponseEntity.ok("Test creado exitosamente con ID: " + evaluacion.getId());
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{evaluacionId}/preguntas")
    public ResponseEntity<PreguntaDTO> agregarPregunta(
            @PathVariable Long evaluacionId,
            @Valid @RequestBody PreguntaDTO preguntaDTO,
            Authentication authentication
    ) {
        Usuario usuario = getUsuarioAutenticado(authentication);
        PreguntaDTO nuevaPregunta = evaluacionService.agregarPregunta(evaluacionId, preguntaDTO, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaPregunta);
    }

    @PostMapping("/{evaluacionId}/test")
    public ResponseEntity<Map<String, Object>> testEndpoint(
            @PathVariable Long evaluacionId,
            @RequestBody(required = false) Map<String, Object> request
    ) {
        System.out.println("=== TEST ENDPOINT LLAMADO ===");
        System.out.println("Evaluacion ID: " + evaluacionId);
        System.out.println("Request: " + request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Endpoint funcionando");
        response.put("evaluacionId", evaluacionId);
        response.put("aprobado", true);
        response.put("puntuacion", 95);
        response.put("notaMinima", 70);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{evaluacionId}/responder-empleado")
    public ResponseEntity<Map<String, Object>> responderEvaluacionEmpleado(
            @PathVariable Long evaluacionId,
            @RequestBody Map<String, Object> request
    ) {
        try {
            System.out.println("=== GUARDANDO RESPUESTA REAL ===");
            System.out.println("Evaluacion ID: " + evaluacionId);
            System.out.println("Request: " + request);
            
            // Obtener evaluación
            Evaluacion evaluacion = evaluacionRepo.findById(evaluacionId)
                    .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
            
            // Crear usuario temporal para prueba (usar el primer usuario empleado)
            Usuario usuarioTemp = usuarioRepository.findAll().stream()
                    .filter(u -> "EMPLEADO".equals(u.getRol()))
                    .findFirst()
                    .orElse(null);
            
            if (usuarioTemp == null) {
                throw new RuntimeException("No se encontró usuario empleado");
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> respuestasMap = (Map<String, Object>) request.get("respuestas");
            
            // Calcular puntaje real
            int puntajeObtenido = 0;
            int puntajeMaximo = 0;
            
            for (Pregunta pregunta : evaluacion.getPreguntas()) {
                puntajeMaximo += pregunta.getPuntaje();
                
                String preguntaIdStr = pregunta.getId().toString();
                if (respuestasMap != null && respuestasMap.containsKey(preguntaIdStr)) {
                    Object respuestaObj = respuestasMap.get(preguntaIdStr);
                    
                    if ("texto".equals(pregunta.getTipo())) {
                        // Para preguntas de texto, dar puntos completos por ahora
                        puntajeObtenido += pregunta.getPuntaje();
                    } else {
                        try {
                            Long respuestaSeleccionadaId = Long.parseLong(respuestaObj.toString());
                            Respuesta respuestaSeleccionada = respuestaRepo.findById(respuestaSeleccionadaId).orElse(null);
                            if (respuestaSeleccionada != null && respuestaSeleccionada.getEsCorrecta()) {
                                puntajeObtenido += pregunta.getPuntaje();
                            }
                        } catch (NumberFormatException e) {
                            System.err.println("Error parseando respuesta: " + respuestaObj);
                        }
                    }
                }
            }
            
            // Calcular porcentaje y aprobación
            int porcentaje = puntajeMaximo > 0 ? (puntajeObtenido * 100) / puntajeMaximo : 0;
            boolean aprobado = porcentaje >= evaluacion.getNotaMinima();
            
            // Guardar resultado en base de datos
            EvaluacionUsuario evaluacionUsuario = EvaluacionUsuario.builder()
                    .evaluacion(evaluacion)
                    .usuario(usuarioTemp)
                    .puntajeObtenido(puntajeObtenido)
                    .puntajeMaximo(puntajeMaximo)
                    .aprobado(aprobado)
                    .intentos(1)
                    .fechaRealizacion(java.time.LocalDateTime.now())
                    .build();
            
            evaluacionUsuarioRepo.save(evaluacionUsuario);
            
            System.out.println("Resultado guardado: Usuario=" + usuarioTemp.getNombre() + 
                             ", Puntaje=" + puntajeObtenido + "/" + puntajeMaximo + 
                             ", Aprobado=" + aprobado);
            
            Map<String, Object> response = new HashMap<>();
            response.put("aprobado", aprobado);
            response.put("puntuacion", porcentaje);
            response.put("puntajeObtenido", puntajeObtenido);
            response.put("puntajeMaximo", puntajeMaximo);
            response.put("notaMinima", evaluacion.getNotaMinima());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error guardando respuesta: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/{evaluacionId}/responder")
    public ResponseEntity<Map<String, Object>> responderEvaluacion(
            @PathVariable Long evaluacionId,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            System.out.println("=== GUARDANDO RESPUESTAS ===");
            System.out.println("Usuario: " + usuario.getNombre());
            System.out.println("Evaluacion ID: " + evaluacionId);
            System.out.println("Respuestas: " + request.get("respuestas"));
            
            // Obtener evaluación
            Evaluacion evaluacion = evaluacionRepo.findById(evaluacionId)
                    .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
            
            // Verificar si ya respondió
            boolean yaRespondio = evaluacionUsuarioRepo.existsByEvaluacionAndUsuario(evaluacion, usuario);
            if (yaRespondio) {
                throw new RuntimeException("Ya has respondido esta evaluación");
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> respuestasMap = (Map<String, Object>) request.get("respuestas");
            
            // Calcular puntaje
            int puntajeObtenido = 0;
            int puntajeMaximo = 0;
            
            for (Pregunta pregunta : evaluacion.getPreguntas()) {
                puntajeMaximo += pregunta.getPuntaje();
                
                String preguntaIdStr = pregunta.getId().toString();
                if (respuestasMap.containsKey(preguntaIdStr)) {
                    Object respuestaObj = respuestasMap.get(preguntaIdStr);
                    
                    if ("texto".equals(pregunta.getTipo())) {
                        // Para preguntas de texto, siempre dar puntos (simplificado)
                        puntajeObtenido += pregunta.getPuntaje();
                    } else {
                        try {
                            Long respuestaSeleccionadaId = Long.parseLong(respuestaObj.toString());
                            Respuesta respuestaSeleccionada = respuestaRepo.findById(respuestaSeleccionadaId).orElse(null);
                            if (respuestaSeleccionada != null && respuestaSeleccionada.getEsCorrecta()) {
                                puntajeObtenido += pregunta.getPuntaje();
                            }
                        } catch (NumberFormatException e) {
                            System.err.println("Error parseando respuesta: " + respuestaObj);
                        }
                    }
                }
            }
            
            // Calcular porcentaje y aprobación
            int porcentaje = puntajeMaximo > 0 ? (puntajeObtenido * 100) / puntajeMaximo : 0;
            boolean aprobado = porcentaje >= evaluacion.getNotaMinima();
            
            // Guardar resultado en base de datos
            EvaluacionUsuario evaluacionUsuario = EvaluacionUsuario.builder()
                    .evaluacion(evaluacion)
                    .usuario(usuario)
                    .puntajeObtenido(puntajeObtenido)
                    .puntajeMaximo(puntajeMaximo)
                    .aprobado(aprobado)
                    .intentos(1)
                    .fechaRealizacion(java.time.LocalDateTime.now())
                    .build();
            
            evaluacionUsuarioRepo.save(evaluacionUsuario);
            
            System.out.println("Resultado guardado: " + porcentaje + "% - Aprobado: " + aprobado);
            
            // Si aprobó la evaluación, actualizar progreso y verificar si puede generar certificado
            if (aprobado) {
                try {
                    // Actualizar progreso del curso
                    progresoService.actualizarProgresoCurso(evaluacion.getCurso().getId(), usuario);
                    
                    // Verificar si puede generar certificado
                    if (progresoService.puedeGenerarCertificado(evaluacion.getCurso().getId(), usuario)) {
                        CertificadoDTO certificado = certificadoService.generarCertificado(evaluacion.getCurso().getId(), usuario);
                        System.out.println("¡Certificado generado automáticamente! ID: " + certificado.getId());
                    }
                } catch (Exception e) {
                    System.err.println("Error generando certificado automático: " + e.getMessage());
                    // No fallar la respuesta por error en certificado
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("aprobado", aprobado);
            response.put("puntuacion", porcentaje);
            response.put("puntajeObtenido", puntajeObtenido);
            response.put("puntajeMaximo", puntajeMaximo);
            response.put("notaMinima", evaluacion.getNotaMinima());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error respondiendo evaluación: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/pendientes-revision")
    public ResponseEntity<List<Map<String, Object>>> getEvaluacionesPendientesRevision(
            Authentication authentication
    ) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            // Verificar que sea admin o instructor
            if (!"ADMIN".equals(usuario.getRol()) && !"INSTRUCTOR".equals(usuario.getRol())) {
                throw new RuntimeException("No tienes permisos para revisar evaluaciones");
            }
            
            // Buscar evaluaciones con preguntas de texto que no están aprobadas
            List<EvaluacionUsuario> pendientes = evaluacionUsuarioRepo.findAll().stream()
                    .filter(eu -> !eu.getAprobado() && 
                                 eu.getEvaluacion().getPreguntas().stream()
                                   .anyMatch(p -> "texto".equals(p.getTipo())))
                    .collect(java.util.stream.Collectors.toList());
            
            List<Map<String, Object>> response = new java.util.ArrayList<>();
            for (EvaluacionUsuario resultado : pendientes) {
                Map<String, Object> data = new HashMap<>();
                data.put("id", resultado.getId());
                data.put("nombreUsuario", resultado.getUsuario().getNombre());
                data.put("tituloEvaluacion", resultado.getEvaluacion().getTitulo());
                data.put("nombreCurso", resultado.getEvaluacion().getCurso().getTitulo());
                data.put("fechaRealizacion", resultado.getFechaRealizacion());
                data.put("puntajeObtenido", resultado.getPuntajeObtenido());
                data.put("puntajeMaximo", resultado.getPuntajeMaximo());
                
                // Agregar respuestas de texto
                List<Map<String, Object>> respuestas = new java.util.ArrayList<>();
                for (Pregunta pregunta : resultado.getEvaluacion().getPreguntas()) {
                    if ("texto".equals(pregunta.getTipo())) {
                        Map<String, Object> respuesta = new HashMap<>();
                        respuesta.put("pregunta", pregunta.getEnunciado());
                        respuesta.put("respuestaTexto", "Respuesta del usuario"); // Aquí iría la respuesta real
                        respuestas.add(respuesta);
                    }
                }
                data.put("respuestas", respuestas);
                
                response.add(data);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo evaluaciones pendientes: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{evaluacionUsuarioId}/aprobar")
    public ResponseEntity<String> aprobarEvaluacion(
            @PathVariable Long evaluacionUsuarioId,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            if (!"ADMIN".equals(usuario.getRol()) && !"INSTRUCTOR".equals(usuario.getRol())) {
                throw new RuntimeException("No tienes permisos para aprobar evaluaciones");
            }
            
            EvaluacionUsuario evaluacionUsuario = evaluacionUsuarioRepo.findById(evaluacionUsuarioId)
                    .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
            
            Integer puntajeManual = (Integer) request.get("puntajeManual");
            
            evaluacionUsuario.setAprobado(true);
            evaluacionUsuario.setPuntajeObtenido(puntajeManual != null ? puntajeManual : evaluacionUsuario.getPuntajeMaximo());
            
            evaluacionUsuarioRepo.save(evaluacionUsuario);
            
            return ResponseEntity.ok("Evaluación aprobada exitosamente");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/{evaluacionUsuarioId}/rechazar")
    public ResponseEntity<String> rechazarEvaluacion(
            @PathVariable Long evaluacionUsuarioId,
            @RequestBody Map<String, Object> request,
            Authentication authentication
    ) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            if (!"ADMIN".equals(usuario.getRol()) && !"INSTRUCTOR".equals(usuario.getRol())) {
                throw new RuntimeException("No tienes permisos para rechazar evaluaciones");
            }
            
            EvaluacionUsuario evaluacionUsuario = evaluacionUsuarioRepo.findById(evaluacionUsuarioId)
                    .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
            
            evaluacionUsuario.setAprobado(false);
            // Aquí se podría agregar un campo de comentarios
            
            evaluacionUsuarioRepo.save(evaluacionUsuario);
            
            return ResponseEntity.ok("Evaluación rechazada");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/{evaluacionId}/resultados")
    public ResponseEntity<List<Map<String, Object>>> getResultadosEvaluacion(
            @PathVariable Long evaluacionId,
            Authentication authentication
    ) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            // Verificar que sea admin o instructor
            if (!"ADMIN".equals(usuario.getRol()) && !"INSTRUCTOR".equals(usuario.getRol())) {
                throw new RuntimeException("No tienes permisos para ver los resultados");
            }
            
            Evaluacion evaluacion = evaluacionRepo.findById(evaluacionId)
                    .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
            
            List<EvaluacionUsuario> resultados = evaluacionUsuarioRepo.findByEvaluacionOrderByFechaRealizacionDesc(evaluacion);
            
            List<Map<String, Object>> response = new java.util.ArrayList<>();
            for (EvaluacionUsuario resultado : resultados) {
                Map<String, Object> data = new HashMap<>();
                data.put("id", resultado.getId());
                data.put("usuario", resultado.getUsuario().getNombre());
                data.put("correo", resultado.getUsuario().getCorreo());
                data.put("puntajeObtenido", resultado.getPuntajeObtenido());
                data.put("puntajeMaximo", resultado.getPuntajeMaximo());
                data.put("porcentaje", resultado.getPuntajeMaximo() > 0 ? 
                    (resultado.getPuntajeObtenido() * 100) / resultado.getPuntajeMaximo() : 0);
                data.put("aprobado", resultado.getAprobado());
                data.put("fechaRealizacion", resultado.getFechaRealizacion());
                data.put("intentos", resultado.getIntentos());
                response.add(data);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo resultados: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarEvaluacion(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = getUsuarioAutenticado(authentication);
        evaluacionService.eliminarEvaluacion(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
