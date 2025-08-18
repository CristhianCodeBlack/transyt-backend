package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    
    List<Evento> findByFechaInicioBetweenOrderByFechaInicio(LocalDateTime inicio, LocalDateTime fin);
    
    List<Evento> findByEstadoOrderByFechaInicio(Evento.EstadoEvento estado);
    
    @Query("SELECT e FROM Evento e WHERE e.fechaInicio >= :fechaInicio ORDER BY e.fechaInicio ASC")
    List<Evento> findEventosProximos(@Param("fechaInicio") LocalDateTime fechaInicio);
    
    @Query("SELECT e FROM Evento e WHERE YEAR(e.fechaInicio) = :year AND MONTH(e.fechaInicio) = :month ORDER BY e.fechaInicio")
    List<Evento> findEventosPorMes(@Param("year") int year, @Param("month") int month);
}