package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;


public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByCorreo(String correo);
    boolean existsByCorreo(String correo);
    
    long countByActivoTrue();
    
    long countByRol(String rol);
    
    @Query("SELECT u FROM Usuario u WHERE u.empresa.id = :empresaId")
    List<Usuario> findByEmpresaId(@Param("empresaId") Long empresaId);
    
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.empresa.id = :empresaId")
    Long countByEmpresaId(@Param("empresaId") Long empresaId);
}
