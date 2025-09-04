package com.capacitapro.backend.controller;

import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import com.capacitapro.backend.service.CertificadoService;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/modulo-progreso")
@RequiredArgsConstructor

public class ModuloProgresoController {

    private final ModuloProgresoRepository moduloProgresoRepo;
    private final ModuloRepository moduloRepo;
    private final UsuarioRepository usuarioRepo;
    private final CursoUsuarioRepository cursoUsuarioRepo;
    private final SubmoduloRepository submoduloRepo;
    private final SubmoduloProgresoRepository submoduloProgresoRepo;
    private final EvaluacionRepository evaluacionRepo;
    private final EvaluacionUsuarioRepository evaluacionUsuarioRepo;
    private final CertificadoService certificadoService;
    private final com.capacitapro.backend.service.ProgresoService progresoService;

    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepo.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<Map<String, Object>> getProgresoCurso(
            @PathVariable Long cursoId,
            Authentication authentication) {
        
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            
            // Obtener módulos del curso
            List<Modulo> modulos = moduloRepo.findActivosByCursoIdOrderByOrden(cursoId);
            
            // Si no hay módulos, devolver respuesta vacía pero válida
            if (modulos.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("cursoId", cursoId);
                response.put("totalModulos", 0);
                response.put("modulosCompletados", 0);
                response.put("progresoGeneral", 0);
                response.put("modulos", new ArrayList<>());
                return ResponseEntity.ok(response);
            }
            
            // Obtener progreso de cada módulo
            List<Map<String, Object>> modulosProgreso = new ArrayList<>();
            
            for (Modulo modulo : modulos) {
                try {
                    ModuloProgreso progreso = moduloProgresoRepo
                            .findByUsuarioAndModulo(usuario, modulo)
                            .orElse(null);
                    
                    // Obtener submódulos de forma segura
                    List<Submodulo> submodulos = new ArrayList<>();
                    try {
                        submodulos = submoduloRepo.findByModuloIdOrderByOrdenAsc(modulo.getId());
                    } catch (Exception e) {
                        System.err.println("Error obteniendo submódulos: " + e.getMessage());
                    }
                    
                    Map<String, Object> moduloData = new HashMap<>();
                    moduloData.put("id", modulo.getId());
                    moduloData.put("titulo", modulo.getTitulo() != null ? modulo.getTitulo() : "Módulo sin título");
                    moduloData.put("descripcion", modulo.getContenido() != null ? modulo.getContenido() : "");
                    moduloData.put("orden", modulo.getOrden() != null ? modulo.getOrden() : 0);
                    moduloData.put("completado", progreso != null && progreso.getCompletado() != null ? progreso.getCompletado() : false);
                    moduloData.put("porcentajeProgreso", progreso != null && progreso.getPorcentajeProgreso() != null ? progreso.getPorcentajeProgreso() : 0);
                    moduloData.put("fechaInicio", progreso != null ? progreso.getFechaInicio() : null);
                    moduloData.put("fechaCompletado", progreso != null ? progreso.getFechaCompletado() : null);
                    moduloData.put("totalSubmodulos", submodulos.size());
                    
                    // Agregar submódulos de forma segura
                    List<Map<String, Object>> submodulosData = new ArrayList<>();
                    for (Submodulo sub : submodulos) {
                        try {
                            Map<String, Object> subData = new HashMap<>();
                            subData.put("id", sub.getId());
                            subData.put("titulo", sub.getTitulo() != null ? sub.getTitulo() : "Sin título");
                            subData.put("tipo", sub.getTipo() != null ? sub.getTipo() : "TEXTO");
                            subData.put("contenido", sub.getContenido() != null ? sub.getContenido() : "");
                            subData.put("orden", sub.getOrden() != null ? sub.getOrden() : 0);
                            
                            // Verificar si el submódulo está completado (manejar duplicados)
                            boolean completado = false;
                            try {
                                Optional<SubmoduloProgreso> subProgreso = submoduloProgresoRepo.findByUsuarioAndSubmodulo(usuario, sub);
                                completado = subProgreso.isPresent() && Boolean.TRUE.equals(subProgreso.get().getCompletado());
                            } catch (Exception e) {
                                // Si hay duplicados, buscar si alguno está completado
                                List<SubmoduloProgreso> duplicados = submoduloProgresoRepo.findAllByUsuarioAndSubmodulo(usuario, sub);
                                completado = duplicados.stream().anyMatch(sp -> Boolean.TRUE.equals(sp.getCompletado()));
                                System.err.println("Duplicados encontrados para submódulo " + sub.getId() + ": " + duplicados.size());
                            }
                            subData.put("completado", completado);
                            
                            submodulosData.add(subData);
                        } catch (Exception e) {
                            System.err.println("Error procesando submódulo: " + e.getMessage());
                        }
                    }
                    
                    // Agregar evaluaciones del módulo como submódulos
                    try {
                        List<Evaluacion> evaluaciones = evaluacionRepo.findByModuloIdAndActivoTrue(modulo.getId());
                        
                        for (Evaluacion eval : evaluaciones) {
                            Map<String, Object> evalData = new HashMap<>();
                            evalData.put("id", "eval_" + eval.getId()); // ID único para evaluaciones
                            evalData.put("titulo", "Evaluación: " + eval.getTitulo());
                            evalData.put("tipo", "EVALUACION");
                            evalData.put("contenido", eval.getId().toString()); // ID de la evaluación
                            evalData.put("orden", submodulos.size() + evaluaciones.indexOf(eval) + 1); // Al final
                            evalData.put("evaluacionId", eval.getId());
                            evalData.put("descripcion", eval.getDescripcion());
                            evalData.put("notaMinima", eval.getNotaMinima());
                            
                            // Verificar si la evaluación está aprobada
                            boolean evaluacionAprobada = evaluacionUsuarioRepo.findByUsuarioAndEvaluacion(usuario, eval)
                                    .map(eu -> Boolean.TRUE.equals(eu.getAprobado()))
                                    .orElse(false);
                            evalData.put("completado", evaluacionAprobada);
                            
                            submodulosData.add(evalData);
                        }
                        
                        // También buscar evaluaciones por curso si no hay por módulo
                        if (evaluaciones.isEmpty()) {
                            List<Evaluacion> evaluacionesCurso = evaluacionRepo.findActivasByCursoId(modulo.getCurso().getId());
                            
                            for (Evaluacion eval : evaluacionesCurso) {
                                Map<String, Object> evalData = new HashMap<>();
                                evalData.put("id", "eval_" + eval.getId());
                                evalData.put("titulo", "Evaluación: " + eval.getTitulo());
                                evalData.put("tipo", "EVALUACION");
                                evalData.put("contenido", eval.getId().toString());
                                evalData.put("orden", submodulos.size() + evaluacionesCurso.indexOf(eval) + 1);
                                evalData.put("evaluacionId", eval.getId());
                                evalData.put("descripcion", eval.getDescripcion());
                                evalData.put("notaMinima", eval.getNotaMinima());
                                
                                // Verificar si la evaluación está aprobada
                                boolean evaluacionAprobada = evaluacionUsuarioRepo.findByUsuarioAndEvaluacion(usuario, eval)
                                        .map(eu -> Boolean.TRUE.equals(eu.getAprobado()))
                                        .orElse(false);
                                evalData.put("completado", evaluacionAprobada);
                                
                                submodulosData.add(evalData);
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Error procesando evaluaciones: " + e.getMessage());
                        e.printStackTrace();
                    }
                    
                    moduloData.put("submodulos", submodulosData);
                    modulosProgreso.add(moduloData);
                    
                } catch (Exception e) {
                    System.err.println("Error procesando módulo: " + e.getMessage());
                }
            }
            
            // Calcular progreso general del curso - CORREGIDO
            System.out.println("=== CALCULANDO PROGRESO GENERAL DEL CURSO ===");
            int modulosCompletados = 0;
            int totalElementosCurso = 0;
            int elementosCompletadosCurso = 0;
            
            for (Modulo m : modulos) {
                try {
                    // Contar elementos del módulo
                    List<Submodulo> subsModulo = submoduloRepo.findByModuloIdOrderByOrdenAsc(m.getId());
                    List<Evaluacion> evalsModulo = evaluacionRepo.findByModuloIdAndActivoTrue(m.getId());
                    
                    // TAMBIÉN buscar evaluaciones del curso (que aparecen como submódulos en frontend)
                    List<Evaluacion> evalsCurso = evaluacionRepo.findActivasByCursoId(m.getCurso().getId());
                    
                    // Combinar evaluaciones del módulo y del curso
                    List<Evaluacion> todasEvals = new java.util.ArrayList<>(evalsModulo);
                    for (Evaluacion evalCurso : evalsCurso) {
                        // Evitar duplicados si una evaluación está en ambos
                        if (!todasEvals.stream().anyMatch(e -> e.getId().equals(evalCurso.getId()))) {
                            todasEvals.add(evalCurso);
                        }
                    }
                    
                    int elementosModulo = subsModulo.size() + todasEvals.size();
                    System.out.println("DEBUG: Módulo " + m.getId() + " - Submódulos: " + subsModulo.size() + ", Evals módulo: " + evalsModulo.size() + ", Evals curso: " + evalsCurso.size() + ", Total evals: " + todasEvals.size());
                    totalElementosCurso += elementosModulo;
                    
                    // Contar elementos completados
                    Long subsCompletados = submoduloProgresoRepo.countCompletadosByUsuarioAndModulo(usuario, m);
                    long evalsAprobadas = todasEvals.stream()
                            .filter(e -> evaluacionUsuarioRepo.findByUsuarioAndEvaluacion(usuario, e)
                                    .map(eu -> Boolean.TRUE.equals(eu.getAprobado()))
                                    .orElse(false))
                            .count();
                    
                    // CORREGIR: Limitar elementos completados al máximo posible
                    int elementosCompletadosModulo = Math.min(
                        subsCompletados.intValue() + (int) evalsAprobadas, 
                        elementosModulo
                    );
                    elementosCompletadosCurso += elementosCompletadosModulo;
                    
                    System.out.println("Módulo " + m.getId() + ": " + elementosCompletadosModulo + "/" + elementosModulo + " elementos");
                    System.out.println("  - Submódulos completados (original): " + subsCompletados);
                    System.out.println("  - Evaluaciones aprobadas: " + evalsAprobadas);
                    System.out.println("  - Total submódulos: " + subsModulo.size());
                    System.out.println("  - Total evaluaciones: " + todasEvals.size());
                    System.out.println("  - Evaluaciones del módulo: " + evalsModulo.size());
                    System.out.println("  - Evaluaciones del curso: " + evalsCurso.size());
                    
                    // Solo contar módulo como completado si TODOS sus elementos están completados
                    if (elementosModulo > 0 && elementosCompletadosModulo >= elementosModulo) {
                        modulosCompletados++;
                        System.out.println("Módulo " + m.getId() + " COMPLETADO");
                    } else {
                        System.out.println("Módulo " + m.getId() + " NO completado - faltan " + (elementosModulo - elementosCompletadosModulo) + " elementos");
                    }
                } catch (Exception e) {
                    System.err.println("Error calculando progreso módulo " + m.getId() + ": " + e.getMessage());
                }
            }
            
            int progresoGeneral = totalElementosCurso > 0 ? (elementosCompletadosCurso * 100) / totalElementosCurso : 0;
            // LIMITAR progreso máximo a 100%
            progresoGeneral = Math.min(progresoGeneral, 100);
            
            System.out.println("PROGRESO GENERAL: " + elementosCompletadosCurso + "/" + totalElementosCurso + " = " + progresoGeneral + "%");
            System.out.println("MÓDULOS COMPLETADOS: " + modulosCompletados + "/" + modulos.size());
            
            if (elementosCompletadosCurso > totalElementosCurso) {
                System.out.println("WARNING: Hay duplicados en la BD - elementos completados > total");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("cursoId", cursoId);
            response.put("totalModulos", modulos.size());
            response.put("modulosCompletados", modulosCompletados);
            response.put("progresoGeneral", progresoGeneral);
            response.put("modulos", modulosProgreso);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo progreso: " + e.getMessage());
            e.printStackTrace();
            
            // Devolver respuesta de error pero válida
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("cursoId", cursoId);
            errorResponse.put("totalModulos", 0);
            errorResponse.put("modulosCompletados", 0);
            errorResponse.put("progresoGeneral", 0);
            errorResponse.put("modulos", new ArrayList<>());
            errorResponse.put("error", "Error al cargar el curso");
            
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    @PostMapping("/modulo/{moduloId}/iniciar")
    public ResponseEntity<String> iniciarModulo(
            @PathVariable Long moduloId,
            Authentication authentication) {
        
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Modulo modulo = moduloRepo.findById(moduloId)
                    .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
            
            ModuloProgreso progreso = moduloProgresoRepo
                    .findByUsuarioAndModulo(usuario, modulo)
                    .orElse(ModuloProgreso.builder()
                            .usuario(usuario)
                            .modulo(modulo)
                            .build());
            
            if (progreso.getFechaInicio() == null) {
                progreso.setFechaInicio(LocalDateTime.now());
            }
            
            moduloProgresoRepo.save(progreso);
            
            return ResponseEntity.ok("Módulo iniciado");
            
        } catch (Exception e) {
            System.err.println("Error iniciando módulo: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/modulo/{moduloId}/verificar-completable")
    public ResponseEntity<Map<String, Object>> verificarModuloCompletable(
            @PathVariable Long moduloId,
            Authentication authentication) {
        
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Modulo modulo = moduloRepo.findById(moduloId)
                    .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
            
            List<Submodulo> todosSubmodulos = submoduloRepo.findByModuloIdOrderByOrdenAsc(modulo.getId());
            List<Evaluacion> evaluacionesModulo = evaluacionRepo.findByModuloIdAndActivoTrue(modulo.getId());
            
            Long submodulosCompletados = submoduloProgresoRepo.countCompletadosByUsuarioAndModulo(usuario, modulo);
            long evaluacionesAprobadas = evaluacionesModulo.stream()
                    .filter(e -> evaluacionUsuarioRepo.findByUsuarioAndEvaluacion(usuario, e)
                            .map(eu -> Boolean.TRUE.equals(eu.getAprobado()))
                            .orElse(false))
                    .count();
            
            int totalElementos = todosSubmodulos.size() + evaluacionesModulo.size();
            int elementosCompletados = submodulosCompletados.intValue() + (int) evaluacionesAprobadas;
            
            boolean completable = (elementosCompletados >= totalElementos) && (totalElementos > 0);
            
            Map<String, Object> response = new HashMap<>();
            response.put("completable", completable);
            response.put("elementosCompletados", elementosCompletados);
            response.put("totalElementos", totalElementos);
            response.put("submodulosCompletados", submodulosCompletados);
            response.put("evaluacionesAprobadas", evaluacionesAprobadas);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error verificando módulo completable: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("completable", false);
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    @PostMapping("/modulo/{moduloId}/completar")
    public ResponseEntity<String> completarModulo(
            @PathVariable Long moduloId,
            Authentication authentication) {
        
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Modulo modulo = moduloRepo.findById(moduloId)
                    .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
            
            ModuloProgreso progreso = moduloProgresoRepo
                    .findByUsuarioAndModulo(usuario, modulo)
                    .orElse(ModuloProgreso.builder()
                            .usuario(usuario)
                            .modulo(modulo)
                            .fechaInicio(LocalDateTime.now())
                            .build());
            
            // Verificar si realmente se puede completar el módulo
            List<Submodulo> todosSubmodulos = submoduloRepo.findByModuloIdOrderByOrdenAsc(modulo.getId());
            List<Evaluacion> evaluacionesModulo = evaluacionRepo.findByModuloIdAndActivoTrue(modulo.getId());
            
            Long submodulosCompletados = submoduloProgresoRepo.countCompletadosByUsuarioAndModulo(usuario, modulo);
            long evaluacionesAprobadas = evaluacionesModulo.stream()
                    .filter(e -> evaluacionUsuarioRepo.findByUsuarioAndEvaluacion(usuario, e)
                            .map(eu -> Boolean.TRUE.equals(eu.getAprobado()))
                            .orElse(false))
                    .count();
            
            int totalElementos = todosSubmodulos.size() + evaluacionesModulo.size();
            int elementosCompletados = submodulosCompletados.intValue() + (int) evaluacionesAprobadas;
            
            if (elementosCompletados >= totalElementos && totalElementos > 0) {
                progreso.marcarCompletado();
                moduloProgresoRepo.save(progreso);
                
                // Actualizar progreso del curso
                actualizarProgresoCurso(modulo.getCurso().getId(), usuario);
                
                return ResponseEntity.ok("Módulo completado");
            } else {
                return ResponseEntity.badRequest().body(
                    "No se puede completar el módulo. Faltan elementos por completar: " + 
                    (totalElementos - elementosCompletados) + " de " + totalElementos
                );
            }
            
        } catch (Exception e) {
            System.err.println("Error completando módulo: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/submodulo/{submoduloId}/marcar-visto")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<String> marcarSubmoduloVisto(
            @PathVariable Long submoduloId,
            Authentication authentication) {
        
        try {
            System.out.println("=== MARCANDO SUBMÓDULO COMO VISTO (BACKEND) ===");
            System.out.println("SubmoduloId: " + submoduloId);
            System.out.println("Timestamp: " + LocalDateTime.now());
            
            Usuario usuario = getUsuarioAutenticado(authentication);
            System.out.println("Usuario: " + usuario.getNombre());
            
            Submodulo submodulo = submoduloRepo.findById(submoduloId)
                    .orElseThrow(() -> new RuntimeException("Submódulo no encontrado"));
            
            System.out.println("Submódulo encontrado: " + submodulo.getTitulo());
            System.out.println("Tipo: " + submodulo.getTipo());
            System.out.println("Módulo ID: " + submodulo.getModulo().getId());
            
            Modulo modulo = submodulo.getModulo();
            
            // Verificar que se puede acceder a este submódulo (orden secuencial)
            if (!puedeAccederSubmodulo(usuario, submodulo)) {
                System.err.println("ACCESO DENEGADO: Usuario " + usuario.getNombre() + " intentó acceder a submódulo " + submodulo.getId() + " sin completar anteriores");
                return ResponseEntity.badRequest().body("Debe completar los submódulos anteriores primero");
            }
            
            System.out.println("ACCESO PERMITIDO: Usuario " + usuario.getNombre() + " puede acceder a submódulo " + submodulo.getId());
            
            // Limpiar duplicados antes de procesar
            limpiarDuplicadosSubmoduloProgreso(usuario, modulo);
            
            // Verificar si el submódulo ya fue marcado como visto (manejar duplicados)
            Optional<SubmoduloProgreso> submoduloProgresoOpt;
            try {
                submoduloProgresoOpt = submoduloProgresoRepo.findByUsuarioAndSubmodulo(usuario, submodulo);
            } catch (Exception e) {
                // Limpiar duplicados y obtener el único registro
                List<SubmoduloProgreso> duplicados = submoduloProgresoRepo.findAllByUsuarioAndSubmodulo(usuario, submodulo);
                if (!duplicados.isEmpty()) {
                    SubmoduloProgreso aMantener = duplicados.stream()
                            .filter(sp -> Boolean.TRUE.equals(sp.getCompletado()))
                            .findFirst()
                            .orElse(duplicados.get(duplicados.size() - 1));
                    
                    for (SubmoduloProgreso sp : duplicados) {
                        if (!sp.getId().equals(aMantener.getId())) {
                            try {
                                submoduloProgresoRepo.deleteById(sp.getId());
                            } catch (Exception deleteEx) {
                                System.err.println("Error eliminando duplicado en marcar visto: " + deleteEx.getMessage());
                            }
                        }
                    }
                    
                    submoduloProgresoOpt = Optional.of(aMantener);
                } else {
                    submoduloProgresoOpt = Optional.empty();
                }
            }
            
            if (submoduloProgresoOpt.isPresent() && Boolean.TRUE.equals(submoduloProgresoOpt.get().getCompletado())) {
                System.out.println("DUPLICADO EVITADO: Submódulo " + submoduloId + " ya completado por usuario " + usuario.getNombre());
                return ResponseEntity.ok("Submódulo ya completado anteriormente");
            }
            
            // Marcar submódulo como completado
            SubmoduloProgreso submoduloProgreso;
            if (submoduloProgresoOpt.isPresent()) {
                submoduloProgreso = submoduloProgresoOpt.get();
            } else {
                submoduloProgreso = SubmoduloProgreso.builder()
                        .usuario(usuario)
                        .submodulo(submodulo)
                        .fechaInicio(LocalDateTime.now())
                        .completado(false)
                        .porcentajeProgreso(0)
                        .build();
            }
            
            submoduloProgreso.setCompletado(true);
            submoduloProgreso.setPorcentajeProgreso(100);
            submoduloProgreso.setFechaCompletado(LocalDateTime.now());
            
            System.out.println("GUARDANDO PROGRESO SUBMÓDULO:");
            System.out.println("  - ID: " + submoduloProgreso.getId());
            System.out.println("  - Usuario: " + submoduloProgreso.getUsuario().getNombre());
            System.out.println("  - Submódulo: " + submoduloProgreso.getSubmodulo().getTitulo());
            System.out.println("  - Completado: " + submoduloProgreso.getCompletado());
            System.out.println("  - Porcentaje: " + submoduloProgreso.getPorcentajeProgreso());
            
            SubmoduloProgreso saved = submoduloProgresoRepo.save(submoduloProgreso);
            submoduloProgresoRepo.flush(); // Forzar escritura inmediata a BD
            System.out.println("PROGRESO GUARDADO CON ID: " + saved.getId());
            System.out.println("FLUSH EJECUTADO - Datos escritos a BD");
            
            // Obtener o crear progreso del módulo
            ModuloProgreso progreso = moduloProgresoRepo
                    .findByUsuarioAndModulo(usuario, modulo)
                    .orElse(null);
            
            if (progreso == null) {
                try {
                    progreso = ModuloProgreso.builder()
                            .usuario(usuario)
                            .modulo(modulo)
                            .fechaInicio(LocalDateTime.now())
                            .completado(false)
                            .porcentajeProgreso(0)
                            .build();
                    progreso = moduloProgresoRepo.save(progreso);
                } catch (Exception e) {
                    progreso = moduloProgresoRepo.findByUsuarioAndModulo(usuario, modulo)
                            .orElseThrow(() -> new RuntimeException("Error creando progreso: " + e.getMessage()));
                }
            }
            
            // Recalcular progreso basado en elementos completados
            recalcularProgresoModulo(modulo, usuario, progreso);
            
            moduloProgresoRepo.save(progreso);
            moduloProgresoRepo.flush(); // Forzar escritura del módulo
            System.out.println("PROGRESO MÓDULO GUARDADO Y FLUSHED");
            
            // Actualizar progreso del curso
            actualizarProgresoCurso(modulo.getCurso().getId(), usuario);
            
            return ResponseEntity.ok("Submódulo marcado como visto");
            
        } catch (Exception e) {
            System.err.println("Error marcando submódulo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/evaluacion/{evaluacionId}/completar")
    public ResponseEntity<String> completarEvaluacion(
            @PathVariable Long evaluacionId,
            @RequestParam Integer puntajeObtenido,
            @RequestParam Integer puntajeMaximo,
            Authentication authentication) {
        
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Evaluacion evaluacion = evaluacionRepo.findById(evaluacionId)
                    .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
            
            // Verificar si ya existe un resultado para esta evaluación
            Optional<EvaluacionUsuario> existente = evaluacionUsuarioRepo
                    .findByUsuarioAndEvaluacion(usuario, evaluacion);
            
            EvaluacionUsuario resultado;
            if (existente.isPresent()) {
                resultado = existente.get();
                // Solo actualizar si el nuevo puntaje es mejor
                if (puntajeObtenido > resultado.getPuntajeObtenido()) {
                    resultado.setPuntajeObtenido(puntajeObtenido);
                    resultado.setPuntajeMaximo(puntajeMaximo);
                    resultado.setFechaRealizacion(LocalDateTime.now());
                    resultado.calcularAprobacion();
                }
            } else {
                resultado = EvaluacionUsuario.builder()
                        .usuario(usuario)
                        .evaluacion(evaluacion)
                        .puntajeObtenido(puntajeObtenido)
                        .puntajeMaximo(puntajeMaximo)
                        .fechaRealizacion(LocalDateTime.now())
                        .build();
                resultado.calcularAprobacion();
            }
            
            evaluacionUsuarioRepo.save(resultado);
            
            // Actualizar progreso del curso
            Long cursoId = evaluacion.getModulo() != null ? 
                    evaluacion.getModulo().getCurso().getId() : 
                    evaluacion.getCurso().getId();
            actualizarProgresoCurso(cursoId, usuario);
            
            double porcentaje = puntajeMaximo > 0 ? (puntajeObtenido * 100.0 / puntajeMaximo) : 0;
            String mensaje = resultado.getAprobado() ? 
                    "Evaluación aprobada con " + String.format("%.1f", porcentaje) + "%" : 
                    "Evaluación completada con " + String.format("%.1f", porcentaje) + "% (no aprobada)";
            
            return ResponseEntity.ok(mensaje);
            
        } catch (Exception e) {
            System.err.println("Error completando evaluación: " + e.getMessage());
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    

    @GetMapping("/debug/modulo/{moduloId}")
    public ResponseEntity<Map<String, Object>> debugModulo(@PathVariable Long moduloId) {
        try {
            Map<String, Object> debug = new HashMap<>();
            
            Modulo modulo = moduloRepo.findById(moduloId).orElse(null);
            if (modulo == null) {
                debug.put("error", "Módulo no encontrado");
                return ResponseEntity.ok(debug);
            }
            
            debug.put("moduloId", moduloId);
            debug.put("moduloTitulo", modulo.getTitulo());
            
            // Submódulos
            List<Submodulo> submodulos = submoduloRepo.findByModuloIdOrderByOrdenAsc(moduloId);
            debug.put("totalSubmodulos", submodulos.size());
            
            List<Map<String, Object>> subData = new ArrayList<>();
            for (Submodulo sub : submodulos) {
                Map<String, Object> data = new HashMap<>();
                data.put("id", sub.getId());
                data.put("titulo", sub.getTitulo());
                data.put("tipo", sub.getTipo());
                data.put("orden", sub.getOrden());
                subData.add(data);
            }
            debug.put("submodulos", subData);
            
            // Evaluaciones
            List<Evaluacion> evaluaciones = evaluacionRepo.findByModuloIdAndActivoTrue(moduloId);
            debug.put("totalEvaluaciones", evaluaciones.size());
            
            return ResponseEntity.ok(debug);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    @GetMapping("/debug/submodulo/{submoduloId}/estado")
    public ResponseEntity<Map<String, Object>> debugEstadoSubmodulo(
            @PathVariable Long submoduloId,
            Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Submodulo submodulo = submoduloRepo.findById(submoduloId).orElse(null);
            
            Map<String, Object> debug = new HashMap<>();
            debug.put("submoduloId", submoduloId);
            debug.put("usuarioId", usuario.getId());
            debug.put("usuarioNombre", usuario.getNombre());
            
            if (submodulo == null) {
                debug.put("error", "Submódulo no encontrado");
                return ResponseEntity.ok(debug);
            }
            
            debug.put("submoduloTitulo", submodulo.getTitulo());
            debug.put("submoduloTipo", submodulo.getTipo());
            debug.put("moduloId", submodulo.getModulo().getId());
            
            // Buscar progreso
            try {
                Optional<SubmoduloProgreso> progreso = submoduloProgresoRepo.findByUsuarioAndSubmodulo(usuario, submodulo);
                if (progreso.isPresent()) {
                    debug.put("progresoEncontrado", true);
                    debug.put("completado", progreso.get().getCompletado());
                    debug.put("porcentaje", progreso.get().getPorcentajeProgreso());
                    debug.put("fechaCompletado", progreso.get().getFechaCompletado());
                } else {
                    debug.put("progresoEncontrado", false);
                }
            } catch (Exception e) {
                debug.put("errorProgreso", e.getMessage());
                // Buscar duplicados
                List<SubmoduloProgreso> duplicados = submoduloProgresoRepo.findAllByUsuarioAndSubmodulo(usuario, submodulo);
                debug.put("duplicados", duplicados.size());
                debug.put("algunoCompletado", duplicados.stream().anyMatch(sp -> Boolean.TRUE.equals(sp.getCompletado())));
            }
            
            return ResponseEntity.ok(debug);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    @GetMapping("/debug/progreso-curso/{cursoId}")
    public ResponseEntity<String> debugProgresoCurso(
            @PathVariable Long cursoId,
            Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            progresoService.debugProgresoCurso(cursoId, usuario);
            return ResponseEntity.ok("Debug completado - revisar logs del servidor");
        } catch (Exception e) {
            return ResponseEntity.ok("Error en debug: " + e.getMessage());
        }
    }
    
    @PostMapping("/forzar-actualizacion/{cursoId}")
    public ResponseEntity<String> forzarActualizacionProgreso(
            @PathVariable Long cursoId,
            Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            System.out.println("=== FORZANDO ACTUALIZACIÓN DE PROGRESO ===");
            System.out.println("Usuario: " + usuario.getNombre());
            System.out.println("Curso ID: " + cursoId);
            
            // Forzar actualización del progreso
            progresoService.actualizarProgresoCurso(cursoId, usuario);
            
            return ResponseEntity.ok("Progreso actualizado correctamente");
        } catch (Exception e) {
            System.err.println("Error forzando actualización: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/video-progreso/{submoduloId}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> actualizarProgresoVideo(
            @PathVariable Long submoduloId,
            @RequestBody Map<String, Object> data,
            Authentication authentication) {
        
        try {
            System.out.println("=== ACTUALIZANDO PROGRESO DE VIDEO ===");
            System.out.println("SubmoduloId: " + submoduloId);
            System.out.println("Data: " + data);
            
            Usuario usuario = getUsuarioAutenticado(authentication);
            Submodulo submodulo = submoduloRepo.findById(submoduloId)
                    .orElseThrow(() -> new RuntimeException("Submódulo no encontrado"));

            int tiempoVisto = ((Number) data.get("tiempoVisto")).intValue();
            int duracionTotal = ((Number) data.get("duracionTotal")).intValue();
            
            System.out.println("Tiempo visto: " + tiempoVisto + ", Duración total: " + duracionTotal);

            // Obtener o crear progreso
            SubmoduloProgreso progreso = submoduloProgresoRepo
                    .findByUsuarioAndSubmodulo(usuario, submodulo)
                    .orElse(SubmoduloProgreso.builder()
                            .usuario(usuario)
                            .submodulo(submodulo)
                            .fechaInicio(LocalDateTime.now())
                            .build());

            // Actualizar progreso del video
            progreso.setTiempoVisto(tiempoVisto);
            progreso.setDuracionTotal(duracionTotal);
            
            // Calcular porcentaje
            int porcentaje = duracionTotal > 0 ? (tiempoVisto * 100) / duracionTotal : 0;
            porcentaje = Math.min(porcentaje, 100);
            progreso.setPorcentajeProgreso(porcentaje);
            
            // Marcar como completado si llegó al 90% o más
            boolean completado = porcentaje >= 90;
            progreso.setCompletado(completado);
            
            if (completado && progreso.getFechaCompletado() == null) {
                progreso.setFechaCompletado(LocalDateTime.now());
            }
            
            System.out.println("Porcentaje calculado: " + porcentaje + "%, Completado: " + completado);
            
            SubmoduloProgreso saved = submoduloProgresoRepo.save(progreso);
            submoduloProgresoRepo.flush();
            
            System.out.println("Progreso guardado con ID: " + saved.getId());
            
            // Actualizar progreso del módulo y curso
            Modulo modulo = submodulo.getModulo();
            recalcularProgresoModulo(modulo, usuario, 
                moduloProgresoRepo.findByUsuarioAndModulo(usuario, modulo)
                    .orElse(ModuloProgreso.builder()
                            .usuario(usuario)
                            .modulo(modulo)
                            .fechaInicio(LocalDateTime.now())
                            .build()));
            
            actualizarProgresoCurso(modulo.getCurso().getId(), usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("porcentajeProgreso", progreso.getPorcentajeProgreso());
            response.put("completado", progreso.getCompletado());
            response.put("tiempoVisto", progreso.getTiempoVisto());
            
            System.out.println("Respuesta: " + response);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error actualizando progreso de video: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/debug/evaluaciones/{cursoId}")
    public ResponseEntity<Map<String, Object>> debugEvaluaciones(@PathVariable Long cursoId) {
        try {
            Map<String, Object> debug = new HashMap<>();
            
            // Evaluaciones por curso
            List<Evaluacion> evaluacionesCurso = evaluacionRepo.findActivasByCursoId(cursoId);
            debug.put("evaluacionesCurso", evaluacionesCurso.size());
            
            List<Map<String, Object>> evalData = new ArrayList<>();
            for (Evaluacion eval : evaluacionesCurso) {
                Map<String, Object> data = new HashMap<>();
                data.put("id", eval.getId());
                data.put("titulo", eval.getTitulo());
                data.put("moduloId", eval.getModulo() != null ? eval.getModulo().getId() : null);
                data.put("activo", eval.getActivo());
                evalData.add(data);
            }
            debug.put("evaluaciones", evalData);
            
            // Módulos del curso
            List<Modulo> modulos = moduloRepo.findActivosByCursoIdOrderByOrden(cursoId);
            debug.put("totalModulos", modulos.size());
            
            List<Map<String, Object>> modulosData = new ArrayList<>();
            for (Modulo modulo : modulos) {
                Map<String, Object> data = new HashMap<>();
                data.put("id", modulo.getId());
                data.put("titulo", modulo.getTitulo());
                
                List<Evaluacion> evalModulo = evaluacionRepo.findByModuloIdAndActivoTrue(modulo.getId());
                data.put("evaluaciones", evalModulo.size());
                
                modulosData.add(data);
            }
            debug.put("modulos", modulosData);
            
            return ResponseEntity.ok(debug);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.ok(error);
        }
    }
    
    private void actualizarProgresoCurso(Long cursoId, Usuario usuario) {
        try {
            System.out.println("=== ACTUALIZANDO PROGRESO CURSO (ModuloProgresoController) ===");
            System.out.println("CursoId: " + cursoId + ", Usuario: " + usuario.getNombre());
            
            // Usar ProgresoService para mantener consistencia
            progresoService.actualizarProgresoCurso(cursoId, usuario);
            
            System.out.println("Progreso del curso actualizado usando ProgresoService");
            
        } catch (Exception e) {
            System.err.println("Error actualizando progreso del curso: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void recalcularProgresoModulo(Modulo modulo, Usuario usuario, ModuloProgreso progreso) {
        try {
            List<Submodulo> todosSubmodulos = submoduloRepo.findByModuloIdOrderByOrdenAsc(modulo.getId());
            List<Evaluacion> evaluacionesModulo = evaluacionRepo.findByModuloIdAndActivoTrue(modulo.getId());
            
            // TAMBIÉN buscar evaluaciones del curso (igual que en el cálculo general)
            List<Evaluacion> evaluacionesCurso = evaluacionRepo.findActivasByCursoId(modulo.getCurso().getId());
            
            // Combinar evaluaciones evitando duplicados
            List<Evaluacion> todasEvaluaciones = new java.util.ArrayList<>(evaluacionesModulo);
            for (Evaluacion evalCurso : evaluacionesCurso) {
                if (!todasEvaluaciones.stream().anyMatch(e -> e.getId().equals(evalCurso.getId()))) {
                    todasEvaluaciones.add(evalCurso);
                }
            }
            
            if (todosSubmodulos.isEmpty() && todasEvaluaciones.isEmpty()) {
                progreso.setPorcentajeProgreso(0);
                progreso.setCompletado(false);
                return;
            }
            
            // Contar submódulos completados
            Long submodulosCompletados = submoduloProgresoRepo.countCompletadosByUsuarioAndModulo(usuario, modulo);
            
            // Contar evaluaciones aprobadas (del módulo Y del curso)
            long evaluacionesAprobadas = todasEvaluaciones.stream()
                    .filter(e -> evaluacionUsuarioRepo.findByUsuarioAndEvaluacion(usuario, e)
                            .map(eu -> Boolean.TRUE.equals(eu.getAprobado()))
                            .orElse(false))
                    .count();
            
            int totalElementos = todosSubmodulos.size() + todasEvaluaciones.size();
            int elementosCompletados = submodulosCompletados.intValue() + (int) evaluacionesAprobadas;
            
            System.out.println("=== RECALCULANDO PROGRESO MÓDULO " + modulo.getId() + " ===");
            System.out.println("Total submódulos: " + todosSubmodulos.size());
            System.out.println("Submódulos completados: " + submodulosCompletados);
            System.out.println("Total evaluaciones: " + todasEvaluaciones.size());
            System.out.println("  - Evaluaciones del módulo: " + evaluacionesModulo.size());
            System.out.println("  - Evaluaciones del curso: " + evaluacionesCurso.size());
            System.out.println("Evaluaciones aprobadas: " + evaluacionesAprobadas);
            System.out.println("Total elementos: " + totalElementos);
            System.out.println("Elementos completados: " + elementosCompletados);
            
            // Cálculo correcto del progreso - manejar duplicados
            int nuevoProgreso = 0;
            if (totalElementos > 0) {
                // Limitar elementos completados al total para evitar > 100%
                int elementosValidados = Math.min(elementosCompletados, totalElementos);
                nuevoProgreso = Math.round((float) elementosValidados * 100 / totalElementos);
                
                // Asegurar que no exceda 100% a menos que TODO esté completado
                if (nuevoProgreso >= 100 && elementosValidados < totalElementos) {
                    nuevoProgreso = 99; // Máximo 99% si no está todo completado
                }
                
                // Validación adicional para evitar errores de BD
                nuevoProgreso = Math.max(0, Math.min(100, nuevoProgreso));
            }
            
            System.out.println("Elementos completados (original): " + elementosCompletados);
            System.out.println("Elementos completados (validados): " + Math.min(elementosCompletados, totalElementos));
            System.out.println("Progreso calculado: " + nuevoProgreso + "%");
            System.out.println("Progreso anterior: " + progreso.getPorcentajeProgreso() + "%");
            
            progreso.setPorcentajeProgreso(nuevoProgreso);
            
            // Solo completar si TODOS los elementos están completados (usar elementos validados)
            int elementosValidados = Math.min(elementosCompletados, totalElementos);
            boolean todoCompleto = (elementosValidados >= totalElementos) && (totalElementos > 0);
            progreso.setCompletado(todoCompleto);
            
            if (todoCompleto && progreso.getFechaCompletado() == null) {
                progreso.setFechaCompletado(LocalDateTime.now());
                System.out.println("Módulo marcado como COMPLETADO");
            } else if (!todoCompleto) {
                progreso.setFechaCompletado(null);
                System.out.println("Módulo NO completado - faltan " + (totalElementos - elementosValidados) + " elementos");
            }
            
        } catch (Exception e) {
            System.err.println("Error recalculando progreso: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void limpiarDuplicadosSubmoduloProgreso(Usuario usuario, Modulo modulo) {
        try {
            List<SubmoduloProgreso> progresos = submoduloProgresoRepo.findByUsuarioAndModulo(usuario, modulo);
            Map<Long, List<SubmoduloProgreso>> agrupadosPorSubmodulo = progresos.stream()
                    .collect(Collectors.groupingBy(sp -> sp.getSubmodulo().getId()));
            
            for (Map.Entry<Long, List<SubmoduloProgreso>> entry : agrupadosPorSubmodulo.entrySet()) {
                List<SubmoduloProgreso> duplicados = entry.getValue();
                if (duplicados.size() > 1) {
                    System.out.println("Encontrados " + duplicados.size() + " duplicados para submódulo " + entry.getKey());
                    
                    // Mantener el más reciente o el completado
                    SubmoduloProgreso aMantener = duplicados.stream()
                            .filter(sp -> Boolean.TRUE.equals(sp.getCompletado()))
                            .findFirst()
                            .orElse(duplicados.get(duplicados.size() - 1));
                    
                    // Eliminar los demás de forma segura
                    for (SubmoduloProgreso sp : duplicados) {
                        if (!sp.getId().equals(aMantener.getId())) {
                            try {
                                System.out.println("Eliminando duplicado: " + sp.getId());
                                submoduloProgresoRepo.deleteById(sp.getId());
                            } catch (Exception deleteEx) {
                                System.err.println("Error eliminando duplicado " + sp.getId() + ": " + deleteEx.getMessage());
                                // Continuar con el siguiente
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error limpiando duplicados: " + e.getMessage());
        }
    }
    
    private boolean puedeAccederSubmodulo(Usuario usuario, Submodulo submodulo) {
        try {
            List<Submodulo> todosSubmodulos = submoduloRepo.findByModuloIdOrderByOrdenAsc(submodulo.getModulo().getId());
            
            System.out.println("=== VERIFICANDO ACCESO SECUENCIAL ===");
            System.out.println("Usuario: " + usuario.getNombre());
            System.out.println("Submódulo objetivo: " + submodulo.getId() + " - " + submodulo.getTitulo());
            System.out.println("Total submódulos en módulo: " + todosSubmodulos.size());
            
            // El primer submódulo siempre está disponible
            if (!todosSubmodulos.isEmpty() && todosSubmodulos.get(0).getId().equals(submodulo.getId())) {
                System.out.println("✅ PRIMER SUBMÓDULO - Acceso permitido");
                return true;
            }
            
            // Encontrar el índice del submódulo objetivo
            int targetIndex = -1;
            for (int i = 0; i < todosSubmodulos.size(); i++) {
                if (todosSubmodulos.get(i).getId().equals(submodulo.getId())) {
                    targetIndex = i;
                    break;
                }
            }
            
            if (targetIndex == -1) {
                System.out.println("❌ Submódulo no encontrado en la lista");
                return false;
            }
            
            System.out.println("Submódulo está en posición: " + targetIndex);
            
            // Verificar que TODOS los submódulos anteriores estén completados
            for (int i = 0; i < targetIndex; i++) {
                Submodulo sub = todosSubmodulos.get(i);
                System.out.println("Verificando submódulo anterior " + i + ": " + sub.getId() + " - " + sub.getTitulo());
                
                try {
                    Optional<SubmoduloProgreso> progreso = submoduloProgresoRepo.findByUsuarioAndSubmodulo(usuario, sub);
                    if (!progreso.isPresent()) {
                        System.out.println("  ❌ No hay progreso registrado");
                        return false;
                    }
                    if (!Boolean.TRUE.equals(progreso.get().getCompletado())) {
                        System.out.println("  ❌ No está completado (" + progreso.get().getCompletado() + ")");
                        return false;
                    }
                    System.out.println("  ✅ Completado correctamente");
                } catch (Exception ex) {
                    System.out.println("  ⚠️ Error consultando progreso, verificando duplicados...");
                    // Si hay duplicados, verificar si alguno está completado
                    List<SubmoduloProgreso> duplicados = submoduloProgresoRepo.findAllByUsuarioAndSubmodulo(usuario, sub);
                    boolean completado = duplicados.stream().anyMatch(sp -> Boolean.TRUE.equals(sp.getCompletado()));
                    System.out.println("  Duplicados encontrados: " + duplicados.size() + ", alguno completado: " + completado);
                    if (!completado) {
                        System.out.println("  ❌ Ningún duplicado está completado");
                        return false;
                    }
                    System.out.println("  ✅ Al menos un duplicado está completado");
                }
            }
            
            System.out.println("✅ ACCESO PERMITIDO - Todos los submódulos anteriores completados");
            return true;
        } catch (Exception e) {
            System.err.println("Error verificando acceso a submódulo: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    private int calcularProgresoTotal(long modulosCompletados, int totalModulos, 
                                     long evaluacionesAprobadas, int totalEvaluaciones) {
        if (totalModulos == 0 && totalEvaluaciones == 0) {
            return 0;
        }
        
        // Si no hay evaluaciones, el progreso es 100% módulos
        if (totalEvaluaciones == 0) {
            return totalModulos > 0 ? (int) ((modulosCompletados * 100) / totalModulos) : 0;
        }
        
        // Si hay evaluaciones, 70% módulos + 30% evaluaciones
        double pesoModulos = 0.7;
        double pesoEvaluaciones = 0.3;
        
        double progresoModulos = totalModulos > 0 ? 
                (modulosCompletados / (double) totalModulos) * pesoModulos : 0;
        double progresoEvaluaciones = totalEvaluaciones > 0 ? 
                (evaluacionesAprobadas / (double) totalEvaluaciones) * pesoEvaluaciones : 0;
        
        return (int) Math.round((progresoModulos + progresoEvaluaciones) * 100);
    }
}
