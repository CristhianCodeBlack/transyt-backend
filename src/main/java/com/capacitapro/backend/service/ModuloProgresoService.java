package com.capacitapro.backend.service;

// DEPRECATED: Funcionalidad consolidada en ProgresoService
// Este servicio será eliminado en futuras versiones

import com.capacitapro.backend.entity.Usuario;
import java.util.Map;

public interface ModuloProgresoService {
    void marcarModuloComoCompletado(Long moduloId, Usuario usuario);
    Map<String, Object> obtenerProgresoDelCurso(Long cursoId, Usuario usuario);
}
