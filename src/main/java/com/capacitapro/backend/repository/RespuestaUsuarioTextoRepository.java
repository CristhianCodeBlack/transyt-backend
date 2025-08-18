package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RespuestaUsuarioTextoRepository extends JpaRepository<RespuestaUsuarioTexto, Long> {
    
    List<RespuestaUsuarioTexto> findByEvaluacionUsuario(EvaluacionUsuario evaluacionUsuario);
    
    List<RespuestaUsuarioTexto> findByRevisadaFalse();
    
    @Query("SELECT r FROM RespuestaUsuarioTexto r WHERE r.evaluacionUsuario.evaluacion.curso.empresa.id = :empresaId AND r.revisada = false")
    List<RespuestaUsuarioTexto> findPendientesByEmpresa(@Param("empresaId") Long empresaId);
    
    @Query("SELECT r FROM RespuestaUsuarioTexto r WHERE r.evaluacionUsuario.evaluacion.curso.id = :cursoId")
    List<RespuestaUsuarioTexto> findByCurso(@Param("cursoId") Long cursoId);
}