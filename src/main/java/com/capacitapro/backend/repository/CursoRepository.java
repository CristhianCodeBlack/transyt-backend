package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.Curso;
import com.capacitapro.backend.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CursoRepository extends JpaRepository<Curso, Long> {
    List<Curso> findByEmpresaAndActivoTrue(Empresa empresa);
    
    boolean existsByTituloAndEmpresaAndActivoTrue(String titulo, Empresa empresa);
    
    boolean existsByTituloAndEmpresaAndActivoTrueAndIdNot(String titulo, Empresa empresa, Long id);
    
    @Query("SELECT c FROM Curso c WHERE c.empresa.id = :empresaId AND c.activo = true ORDER BY c.fechaCreacion DESC")
    List<Curso> findActiveCursosByEmpresaId(@Param("empresaId") Long empresaId);
    
    @Query("SELECT c FROM Curso c WHERE c.id = :id AND c.activo = true")
    Optional<Curso> findByIdAndActivoTrue(@Param("id") Long id);
    
    long countByActivoTrue();
    
    @Query("SELECT c FROM Curso c WHERE c.empresa.id = :empresaId")
    List<Curso> findByEmpresaId(@Param("empresaId") Long empresaId);
}
