package com.capacitapro.backend.service;

import com.capacitapro.backend.dto.*;
import com.capacitapro.backend.entity.Usuario;

import java.util.List;

public interface CursoService {
    List<CursoResponse> listarCursosPorEmpresa(Usuario usuario);
    List<CursoDTO> listarCursosDTO(Long empresaId);
    CursoDTO crearCurso(CursoDTO cursoDTO, Usuario usuario);
    CursoDTO actualizarCurso(Long id, CursoDTO cursoDTO, Usuario usuario);
    CursoDTO obtenerCursoPorId(Long id, Usuario usuario);
    void eliminarCurso(Long id, Usuario usuario);
}
