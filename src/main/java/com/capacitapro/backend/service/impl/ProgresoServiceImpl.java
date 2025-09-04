package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.dto.ProgresoDTO;
import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.event.CursoCompletadoEvent;
import com.capacitapro.backend.repository.CursoRepository;
import com.capacitapro.backend.repository.ModuloRepository;
import com.capacitapro.backend.repository.ModuloProgresoRepository;
import com.capacitapro.backend.repository.CursoUsuarioRepository;
import com.capacitapro.backend.repository.EvaluacionRepository;
import com.capacitapro.backend.repository.EvaluacionUsuarioRepository;
import com.capacitapro.backend.service.ProgresoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProgresoServiceImpl implements ProgresoService {

    private final CursoRepository cursoRepository;
    private final ModuloRepository moduloRepository;
    private final ModuloProgresoRepository moduloProgresoRepository;
    private final CursoUsuarioRepository cursoUsuarioRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final EvaluacionUsuarioRepository evaluacionUsuarioRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public ProgresoDTO obtenerProgresoCurso(Long cursoId, Usuario usuario) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        if (!curso.getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            throw new RuntimeException("No tiene acceso a este curso");
        }
        
        CursoUsuario cursoUsuario = cursoUsuarioRepository.findByCursoAndUsuario(curso, usuario)
                .orElse(null);
        
        Long totalModulos = moduloRepository.countActivosByCursoId(cursoId);
        Long modulosCompletados = moduloProgresoRepository.countCompletadosByUsuarioAndCurso(usuario.getId(), cursoId);
        
        Long totalEvaluaciones = evaluacionRepository.countActivasByCursoId(cursoId);
        Long evaluacionesAprobadas = evaluacionUsuarioRepository.countAprobadasByUsuarioAndCurso(usuario.getId(), cursoId);
        
        Integer porcentajeProgreso = calcularPorcentajeProgreso(modulosCompletados, totalModulos, evaluacionesAprobadas, totalEvaluaciones);
        
        return ProgresoDTO.builder()
                .usuarioId(usuario.getId())
                .nombreUsuario(usuario.getNombre())
                .cursoId(cursoId)
                .nombreCurso(curso.getTitulo())
                .porcentajeProgreso(porcentajeProgreso)
                .completado(cursoUsuario != null ? cursoUsuario.getCompletado() : false)
                .fechaInicio(cursoUsuario != null && cursoUsuario.getFechaInicio() != null ? 
                    cursoUsuario.getFechaInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : null)
                .fechaCompletado(cursoUsuario != null && cursoUsuario.getFechaCompletado() != null ? 
                    cursoUsuario.getFechaCompletado().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : null)
                .modulosCompletados(modulosCompletados.intValue())
                .totalModulos(totalModulos.intValue())
                .evaluacionesAprobadas(evaluacionesAprobadas.intValue())
                .totalEvaluaciones(totalEvaluaciones.intValue())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgresoDTO> listarProgresoEmpresa(Usuario admin) {
        if (!"ADMIN".equals(admin.getRol())) {
            throw new RuntimeException("Solo los administradores pueden ver el progreso de la empresa");
        }
        
        List<CursoUsuario> cursosUsuarios = cursoUsuarioRepository.findByCurso_Empresa(admin.getEmpresa());
        
        return cursosUsuarios.stream()
                .map(cu -> obtenerProgresoCurso(cu.getCurso().getId(), cu.getUsuario()))
                .collect(Collectors.toList());
    }

    @Override
    public void marcarModuloCompletado(Long moduloId, Usuario usuario) {
        Modulo modulo = moduloRepository.findById(moduloId)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
        
        if (!modulo.getCurso().getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            throw new RuntimeException("No tiene acceso a este módulo");
        }
        
        ModuloProgreso progreso = moduloProgresoRepository.findByUsuarioAndModulo(usuario, modulo)
                .orElse(ModuloProgreso.builder()
                        .usuario(usuario)
                        .modulo(modulo)
                        .completado(false)
                        .porcentajeProgreso(0)
                        .build());
        
        if (!progreso.getCompletado()) {
            progreso.marcarCompletado();
            moduloProgresoRepository.save(progreso);
            
            // Actualizar progreso del curso
            actualizarProgresoCurso(modulo.getCurso().getId(), usuario);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void debugProgresoCurso(Long cursoId, Usuario usuario) {
        System.out.println("\n=== DEBUG PROGRESO CURSO DETALLADO ===");
        System.out.println("CursoId: " + cursoId);
        System.out.println("Usuario: " + usuario.getNombre() + " (ID: " + usuario.getId() + ")");
        
        try {
            Curso curso = cursoRepository.findById(cursoId)
                    .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
            
            System.out.println("Curso: " + curso.getTitulo());
            
            // Contar módulos
            Long totalModulos = moduloRepository.countActivosByCursoId(cursoId);
            Long modulosCompletados = moduloProgresoRepository.countCompletadosByUsuarioAndCurso(usuario.getId(), cursoId);
            
            System.out.println("MÓDULOS:");
            System.out.println("  - Total: " + totalModulos);
            System.out.println("  - Completados: " + modulosCompletados);
            
            // Contar evaluaciones con detalle
            Long totalEvaluaciones = evaluacionRepository.countActivasByCursoId(cursoId);
            Long evaluacionesAprobadas = evaluacionUsuarioRepository.countAprobadasByUsuarioAndCurso(usuario.getId(), cursoId);
            
            System.out.println("EVALUACIONES:");
            System.out.println("  - Total: " + totalEvaluaciones);
            System.out.println("  - Aprobadas: " + evaluacionesAprobadas);
            
            // Mostrar evaluaciones detalladas
            List<com.capacitapro.backend.entity.Evaluacion> evaluaciones = evaluacionRepository.findActivasByCursoIdDetailed(cursoId);
            System.out.println("  - Evaluaciones encontradas:");
            for (com.capacitapro.backend.entity.Evaluacion eval : evaluaciones) {
                // Buscar TODOS los intentos de esta evaluación
                List<com.capacitapro.backend.entity.EvaluacionUsuario> intentos = evaluacionUsuarioRepository.findByEvaluacionAndUsuario(eval, usuario);
                boolean aprobada = intentos.stream().anyMatch(eu -> Boolean.TRUE.equals(eu.getAprobado()));
                
                System.out.println("    * ID: " + eval.getId() + ", Título: " + eval.getTitulo() + ", Aprobada: " + aprobada);
                System.out.println("      - Módulo: " + (eval.getModulo() != null ? eval.getModulo().getId() : "CURSO"));
                System.out.println("      - Intentos: " + intentos.size());
                
                if (!intentos.isEmpty()) {
                    for (com.capacitapro.backend.entity.EvaluacionUsuario eu : intentos) {
                        System.out.println("        > Intento ID: " + eu.getId() + ", Puntaje: " + eu.getPuntajeObtenido() + "/" + eu.getPuntajeMaximo() + ", Aprobado: " + eu.getAprobado());
                    }
                    System.out.println("      - Nota mínima requerida: " + eval.getNotaMinima());
                }
            }
            
            // Verificar evaluaciones aprobadas usando el método del repositorio
            List<com.capacitapro.backend.entity.EvaluacionUsuario> evaluacionesAprobadasDetalle = evaluacionUsuarioRepository.findAprobadasByUsuarioAndCurso(usuario.getId(), cursoId);
            System.out.println("  - Evaluaciones aprobadas (repositorio): " + evaluacionesAprobadasDetalle.size());
            for (com.capacitapro.backend.entity.EvaluacionUsuario eu : evaluacionesAprobadasDetalle) {
                System.out.println("    * Evaluación ID: " + eu.getEvaluacion().getId() + ", Título: " + eu.getEvaluacion().getTitulo());
            }
            
            // Calcular progreso
            Integer porcentajeProgreso = calcularPorcentajeProgreso(modulosCompletados, totalModulos, evaluacionesAprobadas, totalEvaluaciones);
            System.out.println("PROGRESO CALCULADO: " + porcentajeProgreso + "%");
            
            // Verificar si puede generar certificado
            boolean puedeGenerar = puedeGenerarCertificado(cursoId, usuario);
            System.out.println("PUEDE GENERAR CERTIFICADO: " + puedeGenerar);
            
            // Verificar estado actual en BD
            CursoUsuario cursoUsuario = cursoUsuarioRepository.findByCursoAndUsuario(curso, usuario).orElse(null);
            if (cursoUsuario != null) {
                System.out.println("ESTADO EN BD:");
                System.out.println("  - Completado: " + cursoUsuario.getCompletado());
                System.out.println("  - Progreso BD: " + cursoUsuario.getPorcentajeProgreso() + "%");
                System.out.println("  - Fecha completado: " + cursoUsuario.getFechaCompletado());
            } else {
                System.out.println("ESTADO EN BD: No hay registro CursoUsuario");
            }
            
        } catch (Exception e) {
            System.err.println("Error en debug: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== FIN DEBUG PROGRESO CURSO ===");
    }

    @Override
    public void actualizarProgresoCurso(Long cursoId, Usuario usuario) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        CursoUsuario cursoUsuario = cursoUsuarioRepository.findByCursoAndUsuario(curso, usuario)
                .orElse(CursoUsuario.builder()
                        .curso(curso)
                        .usuario(usuario)
                        .completado(false)
                        .porcentajeProgreso(0)
                        .build());
        
        if (cursoUsuario.getFechaInicio() == null) {
            cursoUsuario.iniciarCurso();
        }
        
        Long totalModulos = moduloRepository.countActivosByCursoId(cursoId);
        Long modulosCompletados = moduloProgresoRepository.countCompletadosByUsuarioAndCurso(usuario.getId(), cursoId);
        
        Long totalEvaluaciones = evaluacionRepository.countActivasByCursoId(cursoId);
        Long evaluacionesAprobadas = evaluacionUsuarioRepository.countAprobadasByUsuarioAndCurso(usuario.getId(), cursoId);
        
        Integer porcentajeProgreso = calcularPorcentajeProgreso(modulosCompletados, totalModulos, evaluacionesAprobadas, totalEvaluaciones);
        cursoUsuario.setPorcentajeProgreso(porcentajeProgreso);
        
        // Marcar como completado si terminó todo
        if (porcentajeProgreso >= 100 && !cursoUsuario.getCompletado()) {
            cursoUsuario.completarCurso();
            
            // Publicar evento para generar certificado (evita dependencia circular)
            if (puedeGenerarCertificado(cursoId, usuario)) {
                eventPublisher.publishEvent(new CursoCompletadoEvent(cursoId, usuario.getId()));
                System.out.println("✅ Evento de curso completado publicado para " + usuario.getNombre());
            }
        }
        
        cursoUsuarioRepository.save(cursoUsuario);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean puedeGenerarCertificado(Long cursoId, Usuario usuario) {
        try {
            // Verificar que el curso existe y el usuario tiene acceso
            Curso curso = cursoRepository.findById(cursoId)
                    .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
            
            if (!curso.getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
                return false;
            }
            
            // Verificar módulos completados (100% requerido)
            Long totalModulos = moduloRepository.countActivosByCursoId(cursoId);
            Long modulosCompletados = moduloProgresoRepository.countCompletadosByUsuarioAndCurso(usuario.getId(), cursoId);
            boolean todosModulosCompletados = totalModulos > 0 && modulosCompletados.equals(totalModulos);
            
            // Verificar evaluaciones aprobadas (100% requerido)
            Long totalEvaluaciones = evaluacionRepository.countActivasByCursoId(cursoId);
            Long evaluacionesAprobadas = evaluacionUsuarioRepository.countAprobadasByUsuarioAndCurso(usuario.getId(), cursoId);
            boolean todasEvaluacionesAprobadas = totalEvaluaciones == 0 || evaluacionesAprobadas >= totalEvaluaciones;
            
            System.out.println("=== VERIFICACIÓN CERTIFICADO ===");
            System.out.println("Usuario: " + usuario.getNombre());
            System.out.println("Curso: " + curso.getTitulo());
            System.out.println("Módulos: " + modulosCompletados + "/" + totalModulos + " = " + todosModulosCompletados);
            System.out.println("Evaluaciones: " + evaluacionesAprobadas + "/" + totalEvaluaciones + " = " + todasEvaluacionesAprobadas);
            System.out.println("PUEDE GENERAR: " + (todosModulosCompletados && todasEvaluacionesAprobadas));
            System.out.println("================================");
            
            return todosModulosCompletados && todasEvaluacionesAprobadas;
            
        } catch (Exception e) {
            System.err.println("Error verificando certificado: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private Integer calcularPorcentajeProgreso(Long modulosCompletados, Long totalModulos, Long evaluacionesAprobadas, Long totalEvaluaciones) {
        if (totalModulos == 0 && totalEvaluaciones == 0) {
            return 0;
        }
        
        // USAR LA MISMA LÓGICA QUE EL PROGRESO GENERAL QUE FUNCIONA BIEN
        // Contar elementos totales y completados (igual que ModuloProgresoController líneas 175-200)
        long totalElementos = totalModulos + totalEvaluaciones;
        long elementosCompletados = modulosCompletados + evaluacionesAprobadas;
        
        if (totalElementos == 0) {
            return 0;
        }
        
        // Limitar elementos completados al máximo posible para evitar > 100%
        elementosCompletados = Math.min(elementosCompletados, totalElementos);
        
        // Cálculo exacto del Progreso General que funciona
        int progreso = totalElementos > 0 ? (int) ((elementosCompletados * 100) / totalElementos) : 0;
        
        // Limitar progreso máximo a 100%
        progreso = Math.min(progreso, 100);
        
        return progreso;
    }
}