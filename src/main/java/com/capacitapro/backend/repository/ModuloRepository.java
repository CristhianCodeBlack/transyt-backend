package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.Modulo;
import com.capacitapro.backend.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ModuloRepository extends JpaRepository<Modulo, Long> {
    List<Modulo> findByCurso(Curso curso);
    
    List<Modulo> findByCursoAndActivoTrueOrderByOrden(Curso curso);
    
    boolean existsByCursoAndOrdenAndActivoTrue(Curso curso, Integer orden);
    
    boolean existsByCursoAndOrdenAndActivoTrueAndIdNot(Curso curso, Integer orden, Long id);
    
    @Query("SELECT m FROM Modulo m WHERE m.curso.id = :cursoId AND m.activo = true ORDER BY m.orden")
    List<Modulo> findActivosByCursoIdOrderByOrden(@Param("cursoId") Long cursoId);
    
    @Query("SELECT COUNT(m) FROM Modulo m WHERE m.curso.id = :cursoId AND m.activo = true")
    Long countActivosByCursoId(@Param("cursoId") Long cursoId);
    
    List<Modulo> findByCursoOrderByOrdenAsc(Curso curso);
}
