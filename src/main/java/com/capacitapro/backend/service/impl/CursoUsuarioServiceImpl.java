package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.dto.AsignarCursoRequest;
import com.capacitapro.backend.dto.CursoAsignadoResponse;
import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import com.capacitapro.backend.service.CursoUsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CursoUsuarioServiceImpl implements CursoUsuarioService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoUsuarioRepository cursoUsuarioRepository;

    @Override
    public void asignarUsuariosACurso(AsignarCursoRequest request) {
        Curso curso = cursoRepository.findById(request.getCursoId())
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        List<Usuario> usuarios = usuarioRepository.findAllById(request.getUsuarioIds());

        for (Usuario usuario : usuarios) {
            CursoUsuario cursoUsuario = CursoUsuario.builder()
                    .curso(curso)
                    .usuario(usuario)
                    .fechaAsignacion(LocalDateTime.now())
                    .build();
            cursoUsuarioRepository.save(cursoUsuario);
        }
    }

    @Override
    public List<CursoAsignadoResponse> obtenerCursosAsignados(Usuario usuario) {
        return cursoUsuarioRepository.findByUsuarioId(usuario.getId())
                .stream()
                .filter(cu -> cu.getCurso().getActivo()) // Solo cursos activos
                .map(cu -> CursoAsignadoResponse.builder()
                        .id(cu.getId())
                        .cursoId(cu.getCurso().getId())
                        .titulo(cu.getCurso().getTitulo())
                        .descripcion(cu.getCurso().getDescripcion())
                        .fechaAsignacion(cu.getFechaAsignacion())
                        .completado(cu.getCompletado())
                        .iniciado(cu.getFechaInicio() != null)
                        .progreso(cu.getPorcentajeProgreso())
                        .build())
                .collect(Collectors.toList());
    }
}
