package com.capacitapro.backend.service;

import com.capacitapro.backend.dto.*;
import com.capacitapro.backend.entity.Usuario;

import java.util.List;

public interface ModuloService {
    List<ModuloResponse> listarPorCurso(Long cursoId, Usuario usuario);
    List<ModuloDTO> listarModulosDTO(Long cursoId, Usuario usuario);
    ModuloDTO crear(ModuloDTO moduloDTO, Usuario usuario);
    ModuloDTO actualizar(Long id, ModuloDTO moduloDTO, Usuario usuario);
    ModuloDTO obtenerPorId(Long id, Usuario usuario);
    void eliminar(Long id, Usuario usuario);
}
