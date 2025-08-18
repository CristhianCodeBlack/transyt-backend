package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.CapacitacionEnVivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CapacitacionEnVivoRepository extends JpaRepository<CapacitacionEnVivo, Long> {
    List<CapacitacionEnVivo> findByCurso_Id(Long cursoId);
    
    @Query("SELECT c FROM CapacitacionEnVivo c WHERE c.curso.empresa.id = :empresaId ORDER BY c.fechaInicio DESC")
    List<CapacitacionEnVivo> findByEmpresaIdOrderByFechaDesc(@Param("empresaId") Long empresaId);
}
