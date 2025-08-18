package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.ModuloProgresoRepository;
import com.capacitapro.backend.repository.ModuloRepository;
import com.capacitapro.backend.service.ModuloProgresoService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ModuloProgresoServiceImpl implements ModuloProgresoService {

    private final ModuloProgresoRepository moduloProgresoRepository;
    private final ModuloRepository moduloRepository;

    @Override
    @Transactional
    public void marcarModuloComoCompletado(Long moduloId, Usuario usuario) {
        Modulo modulo = moduloRepository.findById(moduloId)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        moduloProgresoRepository.findByUsuarioAndModulo(usuario, modulo)
                .ifPresentOrElse(mp -> {
                    mp.setCompletado(true);
                    moduloProgresoRepository.save(mp);
                }, () -> {
                    ModuloProgreso nuevo = ModuloProgreso.builder()
                            .usuario(usuario)
                            .modulo(modulo)
                            .completado(true)
                            .build();
                    moduloProgresoRepository.save(nuevo);
                });
    }

    @Override
    public Map<String, Object> obtenerProgresoDelCurso(Long cursoId, Usuario usuario) {
        long total = moduloProgresoRepository.countByModulo_Curso_Id(cursoId);
        long completados = moduloProgresoRepository.countByUsuarioAndModulo_Curso_IdAndCompletadoIsTrue(usuario, cursoId);

        double porcentaje = total > 0 ? ((double) completados / total) * 100 : 0;

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("completados", completados);
        resultado.put("total", total);
        resultado.put("porcentaje", porcentaje);
        return resultado;
    }
}
