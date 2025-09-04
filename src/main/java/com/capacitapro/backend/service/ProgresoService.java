package com.capacitapro.backend.service;

import com.capacitapro.backend.dto.ProgresoDTO;
import com.capacitapro.backend.entity.Usuario;

import java.util.List;

public interface ProgresoService {
    
    ProgresoDTO obtenerProgresoCurso(Long cursoId, Usuario usuario);
    
    List<ProgresoDTO> listarProgresoEmpresa(Usuario admin);
    
    void marcarModuloCompletado(Long moduloId, Usuario usuario);
    
    void actualizarProgresoCurso(Long cursoId, Usuario usuario);
    
    void debugProgresoCurso(Long cursoId, Usuario usuario);
    
    boolean puedeGenerarCertificado(Long cursoId, Usuario usuario);
}