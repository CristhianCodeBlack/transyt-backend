package com.capacitapro.backend.service;

import java.util.List;
import java.util.Map;

public interface CursoAdminService {
    Map<String, Object> saveModulos(Long cursoId, List<Map<String, Object>> modulosData);
    String asignarInstructor(Long cursoId, Long instructorId);
    String asignarUsuario(Long usuarioId, Long cursoId);
    List<Map<String, Object>> getUsuariosCurso(Long cursoId);
    Map<String, Object> getInstructorCurso(Long cursoId);
}