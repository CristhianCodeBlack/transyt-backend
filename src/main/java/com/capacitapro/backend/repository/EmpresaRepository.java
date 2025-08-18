package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    boolean existsByNombre(String nombre);
}
