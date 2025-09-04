package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EvaluacionUsuarioRepository extends JpaRepository<EvaluacionUsuario, Long> {

    Optional<EvaluacionUsuario> findTopByUsuarioAndEvaluacion_CursoAndAprobadoIsTrueOrderByFechaRealizacionDesc(Usuario usuario, Curso curso);
    
    Optional<EvaluacionUsuario> findByUsuarioAndEvaluacion(Usuario usuario, Evaluacion evaluacion);
    
    boolean existsByEvaluacionAndUsuario(Evaluacion evaluacion, Usuario usuario);
    
    List<EvaluacionUsuario> findByUsuarioAndEvaluacion_Curso(Usuario usuario, Curso curso);
    
    @Query("SELECT eu FROM EvaluacionUsuario eu WHERE eu.usuario.id = :usuarioId AND eu.evaluacion.curso.id = :cursoId")
    List<EvaluacionUsuario> findByUsuarioIdAndCursoId(@Param("usuarioId") Long usuarioId, @Param("cursoId") Long cursoId);
    
    @Query("SELECT COUNT(eu) FROM EvaluacionUsuario eu WHERE eu.usuario.id = :usuarioId AND eu.aprobado = true")
    Long countAprobadasByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT COUNT(eu) FROM EvaluacionUsuario eu WHERE eu.usuario.id = :usuarioId AND eu.evaluacion.curso.id = :cursoId AND eu.aprobado = true")
    Long countAprobadasByUsuarioAndCurso(@Param("usuarioId") Long usuarioId, @Param("cursoId") Long cursoId);
    
    List<EvaluacionUsuario> findByEvaluacion_Curso_Empresa_IdOrderByFechaRealizacionDesc(Long empresaId);
    
    List<EvaluacionUsuario> findByEvaluacionOrderByFechaRealizacionDesc(Evaluacion evaluacion);
    
    List<EvaluacionUsuario> findByUsuarioOrderByFechaRealizacionDesc(Usuario usuario);
    
    List<EvaluacionUsuario> findByEvaluacionAndUsuario(Evaluacion evaluacion, Usuario usuario);
}
