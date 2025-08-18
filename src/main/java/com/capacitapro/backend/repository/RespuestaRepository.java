package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.Respuesta;
import com.capacitapro.backend.entity.Pregunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface RespuestaRepository extends JpaRepository<Respuesta, Long> {
    List<Respuesta> findByPreguntaId(Long preguntaId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Respuesta r WHERE r.pregunta = :pregunta")
    void deleteByPregunta(@Param("pregunta") Pregunta pregunta);
}
