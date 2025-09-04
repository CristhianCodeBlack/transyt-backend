package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.Evaluacion;
import com.capacitapro.backend.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    Optional<Evaluacion> findByCursoId(Long cursoId);
    
    List<Evaluacion> findByCursoAndActivoTrueOrderByFechaCreacionDesc(Curso curso);
    
    boolean existsByTituloAndCursoAndActivoTrue(String titulo, Curso curso);
    
    @Query("SELECT e FROM Evaluacion e WHERE e.curso.id = :cursoId AND e.activo = true")
    List<Evaluacion> findActivasByCursoId(@Param("cursoId") Long cursoId);
    
    @Query("SELECT COUNT(e) FROM Evaluacion e WHERE e.curso.id = :cursoId AND e.activo = true")
    Long countActivasByCursoId(@Param("cursoId") Long cursoId);
    
    @Query("SELECT e FROM Evaluacion e WHERE e.curso.id = :cursoId AND e.activo = true ORDER BY e.id")
    List<Evaluacion> findActivasByCursoIdDetailed(@Param("cursoId") Long cursoId);
    
    List<Evaluacion> findByModuloIdAndActivoTrue(Long moduloId);
}
