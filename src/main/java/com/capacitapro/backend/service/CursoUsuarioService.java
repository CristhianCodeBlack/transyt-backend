package com.capacitapro.backend.service;

import com.capacitapro.backend.dto.AsignarCursoRequest;
import com.capacitapro.backend.dto.CursoAsignadoResponse;
import com.capacitapro.backend.entity.Usuario;

import java.util.List;

public interface CursoUsuarioService {
    void asignarUsuariosACurso(AsignarCursoRequest request);
    List<CursoAsignadoResponse> obtenerCursosAsignados(Usuario usuario);
}
