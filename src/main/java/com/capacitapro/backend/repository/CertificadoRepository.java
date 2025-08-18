package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CertificadoRepository extends JpaRepository<Certificado, Long> {
    Optional<Certificado> findByUsuarioAndCurso(Usuario usuario, Curso curso);
    
    boolean existsByUsuarioAndCurso(Usuario usuario, Curso curso);
    
    Optional<Certificado> findByUsuarioAndCursoAndActivoTrue(Usuario usuario, Curso curso);
    
    List<Certificado> findByUsuarioAndActivoTrueOrderByFechaGeneracionDesc(Usuario usuario);
    
    List<Certificado> findByUsuario_EmpresaAndActivoTrueOrderByFechaGeneracionDesc(Empresa empresa);
    
    Optional<Certificado> findByCodigoVerificacionAndActivoTrue(String codigoVerificacion);
    
    @Query("SELECT COUNT(c) FROM Certificado c WHERE c.usuario.empresa.id = :empresaId AND c.activo = true")
    Long countActivosByEmpresaId(@Param("empresaId") Long empresaId);
    
    @Query("SELECT COUNT(c) FROM Certificado c WHERE c.usuario.id = :usuarioId AND c.activo = true")
    Long countActivosByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    List<Certificado> findTop5ByOrderByFechaGeneracionDesc();
    
    @Query("SELECT c.id, c.codigoVerificacion, c.fechaGeneracion, c.activo, c.curso.id, c.curso.titulo, c.curso.descripcion FROM Certificado c WHERE c.usuario = :usuario AND c.activo = true ORDER BY c.fechaGeneracion DESC")
    List<Object[]> findCertificadosSinPdfByUsuario(@Param("usuario") Usuario usuario);
}
