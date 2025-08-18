package com.capacitapro.backend.service;

import com.capacitapro.backend.dto.*;
import com.capacitapro.backend.entity.*;

import java.util.List;

public interface EvaluacionService {

    List<EvaluacionDTO> listarPorCurso(Long cursoId, Usuario usuario);
    EvaluacionDTO crearEvaluacion(EvaluacionDTO evaluacionDTO, Usuario usuario);
    EvaluacionDTO obtenerPorId(Long id, Usuario usuario);
    PreguntaDTO agregarPregunta(Long evaluacionId, PreguntaDTO preguntaDTO, Usuario usuario);
    EvaluacionUsuario responderEvaluacion(Long evaluacionId, Usuario usuario, List<RespuestaUsuarioRequest> respuestasUsuario);
    void eliminarEvaluacion(Long id, Usuario usuario);
    
    // Métodos sin validación
    EvaluacionDTO crearEvaluacionSinValidacion(EvaluacionDTO evaluacionDTO);
    PreguntaDTO agregarPreguntaSinValidacion(Long evaluacionId, PreguntaDTO preguntaDTO);
    EvaluacionDTO obtenerPorIdSinValidacion(Long id);
}
