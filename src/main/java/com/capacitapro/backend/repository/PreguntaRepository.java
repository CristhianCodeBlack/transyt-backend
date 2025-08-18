package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.Pregunta;
import com.capacitapro.backend.entity.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PreguntaRepository extends JpaRepository<Pregunta, Long> {
    List<Pregunta> findByEvaluacionId(Long evaluacionId);
    List<Pregunta> findByEvaluacion(Evaluacion evaluacion);
}
