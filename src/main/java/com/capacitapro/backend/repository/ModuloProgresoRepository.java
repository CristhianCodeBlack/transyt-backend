package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.ModuloProgreso;
import com.capacitapro.backend.entity.Usuario;
import com.capacitapro.backend.entity.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ModuloProgresoRepository extends JpaRepository<ModuloProgreso, Long> {

    Optional<ModuloProgreso> findByUsuarioAndModulo(Usuario usuario, Modulo modulo);

    List<ModuloProgreso> findByUsuarioAndModulo_Curso_Id(Usuario usuario, Long cursoId);

    long countByUsuarioAndModulo_Curso_IdAndCompletadoIsTrue(Usuario usuario, Long cursoId);

    long countByModulo_Curso_Id(Long cursoId);
    
    @Query("SELECT COUNT(mp) FROM ModuloProgreso mp WHERE mp.usuario.id = :usuarioId AND mp.modulo.curso.id = :cursoId AND mp.completado = true")
    Long countCompletadosByUsuarioAndCurso(@Param("usuarioId") Long usuarioId, @Param("cursoId") Long cursoId);
    
    @Query("SELECT mp FROM ModuloProgreso mp WHERE mp.usuario.empresa.id = :empresaId")
    List<ModuloProgreso> findByEmpresaId(@Param("empresaId") Long empresaId);
    
    void deleteByModulo(Modulo modulo);
}
