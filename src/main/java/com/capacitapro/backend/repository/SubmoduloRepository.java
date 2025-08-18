package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.Submodulo;
import com.capacitapro.backend.entity.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmoduloRepository extends JpaRepository<Submodulo, Long> {
    List<Submodulo> findByModuloOrderByOrdenAsc(Modulo modulo);
    List<Submodulo> findByModuloIdOrderByOrdenAsc(Long moduloId);
    void deleteByModuloId(Long moduloId);
}