package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CursoUsuarioRepository extends JpaRepository<CursoUsuario, Long> {
    List<CursoUsuario> findByUsuarioId(Long usuarioId);
    
    List<CursoUsuario> findByUsuario(Usuario usuario);
    
    Optional<CursoUsuario> findByCursoAndUsuario(Curso curso, Usuario usuario);
    
    List<CursoUsuario> findByCurso_Empresa(Empresa empresa);
    
    @Query("SELECT cu FROM CursoUsuario cu WHERE cu.curso.empresa.id = :empresaId")
    List<CursoUsuario> findByEmpresaId(@Param("empresaId") Long empresaId);
    
    @Query("SELECT COUNT(cu) FROM CursoUsuario cu WHERE cu.usuario.id = :usuarioId AND cu.completado = true")
    Long countCompletadosByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT AVG(cu.porcentajeProgreso) FROM CursoUsuario cu")
    Double findAverageProgreso();
    
    List<CursoUsuario> findTop5ByOrderByFechaAsignacionDesc();
    
    long countByCompletadoTrue();
    
    @Query("SELECT COUNT(cu) FROM CursoUsuario cu WHERE cu.curso.id = :cursoId")
    Long countByCursoId(@Param("cursoId") Long cursoId);
    
    List<CursoUsuario> findByCursoId(Long cursoId);
    
    Optional<CursoUsuario> findByCursoIdAndUsuarioId(Long cursoId, Long usuarioId);
}
