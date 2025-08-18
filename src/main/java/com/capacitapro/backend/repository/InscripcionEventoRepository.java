package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.InscripcionEvento;
import com.capacitapro.backend.entity.Evento;
import com.capacitapro.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscripcionEventoRepository extends JpaRepository<InscripcionEvento, Long> {
    
    Optional<InscripcionEvento> findByEventoAndUsuario(Evento evento, Usuario usuario);
    
    List<InscripcionEvento> findByEventoOrderByFechaInscripcion(Evento evento);
    
    List<InscripcionEvento> findByUsuarioOrderByFechaInscripcionDesc(Usuario usuario);
    
    List<InscripcionEvento> findByEstadoOrderByFechaInscripcion(InscripcionEvento.EstadoInscripcion estado);
    
    @Query("SELECT COUNT(i) FROM InscripcionEvento i WHERE i.evento = :evento AND i.estado = 'APROBADA'")
    long countApprovedByEvento(@Param("evento") Evento evento);
    
    boolean existsByEventoAndUsuario(Evento evento, Usuario usuario);
}