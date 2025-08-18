package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.dto.*;
import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import com.capacitapro.backend.service.EvaluacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class EvaluacionServiceImpl implements EvaluacionService {

    private final EvaluacionRepository evaluacionRepo;
    private final CursoRepository cursoRepo;
    private final PreguntaRepository preguntaRepo;
    private final RespuestaRepository respuestaRepo;
    private final EvaluacionUsuarioRepository evaluacionUsuarioRepo;
    private final UsuarioRepository usuarioRepo;
    private final CertificadoRepository certificadoRepo;

    @Override
    @Transactional(readOnly = true)
    public List<EvaluacionDTO> listarPorCurso(Long cursoId, Usuario usuario) {
        Curso curso = obtenerCursoConPermisos(cursoId, usuario);
        List<Evaluacion> evaluaciones = evaluacionRepo.findByCursoAndActivoTrueOrderByFechaCreacionDesc(curso);
        return evaluaciones.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public EvaluacionDTO crearEvaluacion(EvaluacionDTO evaluacionDTO, Usuario usuario) {
        Curso curso = obtenerCursoConPermisos(evaluacionDTO.getCursoId(), usuario);
        
        // Validar título único en el curso
        if (evaluacionRepo.existsByTituloAndCursoAndActivoTrue(evaluacionDTO.getTitulo(), curso)) {
            throw new RuntimeException("Ya existe una evaluación con ese título en el curso");
        }
        
        Evaluacion evaluacion = Evaluacion.builder()
                .titulo(evaluacionDTO.getTitulo())
                .descripcion(evaluacionDTO.getDescripcion())
                .curso(curso)
                .notaMinima(evaluacionDTO.getNotaMinima() != null ? evaluacionDTO.getNotaMinima() : 70)
                .activo(true)
                .build();
        
        evaluacion = evaluacionRepo.save(evaluacion);
        return mapToDTO(evaluacion);
    }

    @Override
    public PreguntaDTO agregarPregunta(Long evaluacionId, PreguntaDTO preguntaDTO, Usuario usuario) {
        try {
            Evaluacion evaluacion = evaluacionRepo.findById(evaluacionId)
                    .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
            
            System.out.println("=== AGREGANDO PREGUNTA ===");
            System.out.println("Evaluacion ID: " + evaluacionId);
            System.out.println("Pregunta: " + preguntaDTO.getEnunciado());
            System.out.println("Respuestas: " + preguntaDTO.getRespuestas().size());
            
            // Validar solo si hay respuestas (para preguntas de opción múltiple)
            if (preguntaDTO.getRespuestas() != null && !preguntaDTO.getRespuestas().isEmpty()) {
                long respuestasCorrectas = preguntaDTO.getRespuestas().stream()
                        .mapToLong(r -> r.getEsCorrecta() ? 1 : 0)
                        .sum();
                
                if (respuestasCorrectas == 0) {
                    throw new RuntimeException("La pregunta debe tener al menos una respuesta correcta");
                }
            }
            
            Pregunta pregunta = Pregunta.builder()
                    .enunciado(preguntaDTO.getEnunciado())
                    .puntaje(preguntaDTO.getPuntaje() != null ? preguntaDTO.getPuntaje() : 1)
                    .evaluacion(evaluacion)
                    .build();
            
            pregunta = preguntaRepo.save(pregunta);
            System.out.println("Pregunta guardada con ID: " + pregunta.getId());
            
            // Crear respuestas solo si existen
            if (preguntaDTO.getRespuestas() != null) {
                for (RespuestaDTO respuestaDTO : preguntaDTO.getRespuestas()) {
                    Respuesta respuesta = Respuesta.builder()
                            .texto(respuestaDTO.getTexto())
                            .esCorrecta(respuestaDTO.getEsCorrecta() != null ? respuestaDTO.getEsCorrecta() : false)
                            .pregunta(pregunta)
                            .build();
                    respuestaRepo.save(respuesta);
                    System.out.println("Respuesta guardada: " + respuesta.getTexto());
                }
            }
            
            PreguntaDTO result = mapPreguntaToDTO(preguntaRepo.findById(pregunta.getId()).orElseThrow());
            System.out.println("Pregunta completa guardada exitosamente");
            return result;
            
        } catch (Exception e) {
            System.err.println("Error agregando pregunta: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public EvaluacionUsuario responderEvaluacion(Long evaluacionId, Usuario usuario, List<RespuestaUsuarioRequest> respuestasUsuario) {
        Evaluacion evaluacion = evaluacionRepo.findById(evaluacionId)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
        
        // Verificar que el usuario tenga acceso al curso
        if (!evaluacion.getCurso().getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            throw new RuntimeException("No tiene acceso a esta evaluación");
        }
        
        // Verificar si ya respondió la evaluación
        if (evaluacionUsuarioRepo.existsByEvaluacionAndUsuario(evaluacion, usuario)) {
            throw new RuntimeException("Ya ha respondido esta evaluación");
        }
        
        // Validar que todas las preguntas fueron respondidas
        List<Pregunta> preguntas = evaluacion.getPreguntas();
        if (preguntas == null) {
            preguntas = new java.util.ArrayList<>();
        }
        
        if (respuestasUsuario.size() != preguntas.size()) {
            throw new RuntimeException("Debe responder todas las preguntas");
        }
        
        int puntajeObtenido = 0;
        int puntajeMaximo = preguntas.stream().mapToInt(Pregunta::getPuntaje).sum();
        
        for (RespuestaUsuarioRequest respuestaUsuario : respuestasUsuario) {
            Respuesta respuesta = respuestaRepo.findById(respuestaUsuario.getRespuestaId())
                    .orElseThrow(() -> new RuntimeException("Respuesta no encontrada"));
            
            if (respuesta.getEsCorrecta()) {
                puntajeObtenido += respuesta.getPregunta().getPuntaje();
            }
        }
        
        EvaluacionUsuario evaluacionUsuario = EvaluacionUsuario.builder()
                .evaluacion(evaluacion)
                .usuario(usuario)
                .puntajeObtenido(puntajeObtenido)
                .puntajeMaximo(puntajeMaximo)
                .intentos(1)
                .build();
        
        evaluacionUsuario.calcularAprobacion();
        EvaluacionUsuario resultado = evaluacionUsuarioRepo.save(evaluacionUsuario);
        
        // Generar certificado si aprobó
        if (resultado.getAprobado()) {
            generarCertificado(resultado);
        }
        
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluacionDTO obtenerPorId(Long id, Usuario usuario) {
        Evaluacion evaluacion = obtenerEvaluacionConPermisos(id, usuario);
        return mapToDTO(evaluacion);
    }

    @Override
    public void eliminarEvaluacion(Long id, Usuario usuario) {
        Evaluacion evaluacion = obtenerEvaluacionConPermisos(id, usuario);
        evaluacion.setActivo(false);
        evaluacionRepo.save(evaluacion);
    }
    
    // Métodos sin validación para creación rápida
    public EvaluacionDTO crearEvaluacionSinValidacion(EvaluacionDTO evaluacionDTO) {
        Curso curso = cursoRepo.findById(evaluacionDTO.getCursoId())
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        Evaluacion evaluacion = Evaluacion.builder()
                .titulo(evaluacionDTO.getTitulo())
                .descripcion(evaluacionDTO.getDescripcion())
                .curso(curso)
                .notaMinima(evaluacionDTO.getNotaMinima() != null ? evaluacionDTO.getNotaMinima() : 70)
                .activo(true)
                .build();
        
        evaluacion = evaluacionRepo.save(evaluacion);
        return mapToDTO(evaluacion);
    }
    
    public PreguntaDTO agregarPreguntaSinValidacion(Long evaluacionId, PreguntaDTO preguntaDTO) {
        Evaluacion evaluacion = evaluacionRepo.findById(evaluacionId)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
        
        Pregunta pregunta = Pregunta.builder()
                .enunciado(preguntaDTO.getEnunciado())
                .puntaje(preguntaDTO.getPuntaje() != null ? preguntaDTO.getPuntaje() : 1)
                .evaluacion(evaluacion)
                .build();
        
        pregunta = preguntaRepo.save(pregunta);
        
        // Crear respuestas
        if (preguntaDTO.getRespuestas() != null) {
            for (RespuestaDTO respuestaDTO : preguntaDTO.getRespuestas()) {
                Respuesta respuesta = Respuesta.builder()
                        .texto(respuestaDTO.getTexto())
                        .esCorrecta(respuestaDTO.getEsCorrecta() != null ? respuestaDTO.getEsCorrecta() : false)
                        .pregunta(pregunta)
                        .build();
                respuestaRepo.save(respuesta);
            }
        }
        
        return mapPreguntaToDTO(preguntaRepo.findById(pregunta.getId()).orElseThrow());
    }
    
    public EvaluacionDTO obtenerPorIdSinValidacion(Long id) {
        Evaluacion evaluacion = evaluacionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
        return mapToDTO(evaluacion);
    }

    private Curso obtenerCursoConPermisos(Long cursoId, Usuario usuario) {
        Curso curso = cursoRepo.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        if (!curso.getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            throw new RuntimeException("No tiene acceso a este curso");
        }
        
        return curso;
    }
    
    private Evaluacion obtenerEvaluacionConPermisos(Long evaluacionId, Usuario usuario) {
        Evaluacion evaluacion = evaluacionRepo.findById(evaluacionId)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
        
        if (!evaluacion.getCurso().getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            throw new RuntimeException("No tiene acceso a esta evaluación");
        }
        
        return evaluacion;
    }
    
    private EvaluacionDTO mapToDTO(Evaluacion evaluacion) {
        return EvaluacionDTO.builder()
                .id(evaluacion.getId())
                .titulo(evaluacion.getTitulo())
                .descripcion(evaluacion.getDescripcion())
                .cursoId(evaluacion.getCurso().getId())
                .nombreCurso(evaluacion.getCurso().getTitulo())
                .notaMinima(evaluacion.getNotaMinima())
                .activo(evaluacion.getActivo())
                .fechaCreacion(evaluacion.getFechaCreacion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .preguntas(evaluacion.getPreguntas() != null ? 
                    evaluacion.getPreguntas().stream().map(this::mapPreguntaToDTO).collect(Collectors.toList()) : 
                    new java.util.ArrayList<>())
                .build();
    }
    
    private PreguntaDTO mapPreguntaToDTO(Pregunta pregunta) {
        return PreguntaDTO.builder()
                .id(pregunta.getId())
                .enunciado(pregunta.getEnunciado())
                .puntaje(pregunta.getPuntaje())
                .tipo(pregunta.getTipo() != null ? pregunta.getTipo() : "multiple")
                .respuestaEsperada(pregunta.getRespuestaEsperada())
                .evaluacionId(pregunta.getEvaluacion().getId())
                .respuestas(pregunta.getRespuestas() != null ? 
                    pregunta.getRespuestas().stream().map(this::mapRespuestaToDTO).collect(Collectors.toList()) :
                    new java.util.ArrayList<>())
                .build();
    }
    
    private RespuestaDTO mapRespuestaToDTO(Respuesta respuesta) {
        return RespuestaDTO.builder()
                .id(respuesta.getId())
                .texto(respuesta.getTexto())
                .esCorrecta(respuesta.getEsCorrecta())
                .preguntaId(respuesta.getPregunta().getId())
                .build();
    }
    
    private void generarCertificado(EvaluacionUsuario evaluacionUsuario) {
        try {
            // Verificar si ya existe un certificado para esta evaluación y usuario
            boolean existeCertificado = certificadoRepo.existsByUsuarioAndCurso(
                evaluacionUsuario.getUsuario(), 
                evaluacionUsuario.getEvaluacion().getCurso()
            );
            
            if (!existeCertificado) {
                Certificado certificado = Certificado.builder()
                    .usuario(evaluacionUsuario.getUsuario())
                    .curso(evaluacionUsuario.getEvaluacion().getCurso())
                    .activo(true)
                    .build();
                
                certificadoRepo.save(certificado);
                System.out.println("Certificado generado para usuario: " + 
                    evaluacionUsuario.getUsuario().getNombre() + " en curso: " + 
                    evaluacionUsuario.getEvaluacion().getCurso().getTitulo());
            }
        } catch (Exception e) {
            System.err.println("Error generando certificado: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
