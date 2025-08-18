package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.dto.ProgresoDTO;
import com.capacitapro.backend.entity.*;
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
        Long evaluacionesAprobadas = evaluacionUsuarioRepository.countAprobadasByUsuarioId(usuario.getId());
        
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
        Long evaluacionesAprobadas = evaluacionUsuarioRepository.countAprobadasByUsuarioId(usuario.getId());
        
        Integer porcentajeProgreso = calcularPorcentajeProgreso(modulosCompletados, totalModulos, evaluacionesAprobadas, totalEvaluaciones);
        cursoUsuario.setPorcentajeProgreso(porcentajeProgreso);
        
        // Marcar como completado si terminó todo
        if (porcentajeProgreso >= 100 && !cursoUsuario.getCompletado()) {
            cursoUsuario.completarCurso();
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
            Long evaluacionesAprobadas = evaluacionUsuarioRepository.countAprobadasByUsuarioId(usuario.getId());
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
        
        double pesoModulos = 0.7; // 70% del progreso
        double pesoEvaluaciones = 0.3; // 30% del progreso
        
        double progresoModulos = totalModulos > 0 ? (modulosCompletados.doubleValue() / totalModulos.doubleValue()) * pesoModulos : 0;
        double progresoEvaluaciones = totalEvaluaciones > 0 ? (evaluacionesAprobadas.doubleValue() / totalEvaluaciones.doubleValue()) * pesoEvaluaciones : 0;
        
        return (int) Math.round((progresoModulos + progresoEvaluaciones) * 100);
    }
}