package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.AsistenciaEnVivo;
import com.capacitapro.backend.entity.Usuario;
import com.capacitapro.backend.entity.CapacitacionEnVivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AsistenciaEnVivoRepository extends JpaRepository<AsistenciaEnVivo, Long> {
    List<AsistenciaEnVivo> findBySesion_Id(Long sesionId);
    boolean existsBySesionAndUsuario(CapacitacionEnVivo sesion, Usuario usuario);
}
