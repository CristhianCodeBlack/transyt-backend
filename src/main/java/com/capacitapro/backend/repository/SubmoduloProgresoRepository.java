package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubmoduloProgresoRepository extends JpaRepository<SubmoduloProgreso, Long> {
    
    Optional<SubmoduloProgreso> findByUsuarioAndSubmodulo(Usuario usuario, Submodulo submodulo);
    
    List<SubmoduloProgreso> findAllByUsuarioAndSubmodulo(Usuario usuario, Submodulo submodulo);
    
    List<SubmoduloProgreso> findByUsuario(Usuario usuario);
    
    List<SubmoduloProgreso> findBySubmodulo(Submodulo submodulo);
    
    void deleteBySubmodulo(Submodulo submodulo);
    
    @Query("SELECT sp FROM SubmoduloProgreso sp WHERE sp.usuario = :usuario AND sp.submodulo.modulo = :modulo")
    List<SubmoduloProgreso> findByUsuarioAndModulo(@Param("usuario") Usuario usuario, @Param("modulo") Modulo modulo);
    
    @Query("SELECT COUNT(sp) FROM SubmoduloProgreso sp WHERE sp.usuario = :usuario AND sp.submodulo.modulo = :modulo AND sp.completado = true")
    Long countCompletadosByUsuarioAndModulo(@Param("usuario") Usuario usuario, @Param("modulo") Modulo modulo);
    
    @Query("SELECT AVG(sp.porcentajeProgreso) FROM SubmoduloProgreso sp WHERE sp.usuario = :usuario AND sp.submodulo.modulo = :modulo")
    Double getProgresoPromedioByUsuarioAndModulo(@Param("usuario") Usuario usuario, @Param("modulo") Modulo modulo);
}