package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.dto.*;
import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import com.capacitapro.backend.service.CursoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class CursoServiceImpl implements CursoService {

    private final CursoRepository cursoRepository;
    private final EmpresaRepository empresaRepository;
    private final ModuloRepository moduloRepository;
    private final CursoUsuarioRepository cursoUsuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CursoResponse> listarCursosPorEmpresa(Usuario usuario) {
        if (usuario == null || usuario.getEmpresa() == null) {
            throw new IllegalArgumentException("Usuario o empresa no válidos");
        }
        List<Curso> cursos = cursoRepository.findByEmpresaAndActivoTrue(usuario.getEmpresa());
        return cursos.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CursoDTO> listarCursosDTO(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        List<Curso> cursos = cursoRepository.findByEmpresaAndActivoTrue(empresa);
        return cursos.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public CursoDTO crearCurso(CursoDTO cursoDTO, Usuario usuario) {
        validarPermisosEmpresa(usuario);
        
        // Obtener la empresa del DTO
        Empresa empresa = empresaRepository.findById(cursoDTO.getEmpresaId())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        
        // Verificar que no existe un curso con el mismo título en la empresa
        if (cursoRepository.existsByTituloAndEmpresaAndActivoTrue(cursoDTO.getTitulo(), empresa)) {
            throw new RuntimeException("Ya existe un curso con ese título en la empresa");
        }
        
        Curso curso = Curso.builder()
                .titulo(cursoDTO.getTitulo())
                .descripcion(cursoDTO.getDescripcion())
                .empresa(empresa)
                .activo(true)
                .build();
        
        curso = cursoRepository.save(curso);
        return mapToDTO(curso);
    }

    @Override
    public CursoDTO actualizarCurso(Long id, CursoDTO cursoDTO, Usuario usuario) {
        Curso curso = obtenerCursoConPermisos(id, usuario);
        
        // Obtener la empresa del DTO si se proporciona, sino usar la actual
        Empresa empresa = curso.getEmpresa();
        if (cursoDTO.getEmpresaId() != null && !cursoDTO.getEmpresaId().equals(curso.getEmpresa().getId())) {
            empresa = empresaRepository.findById(cursoDTO.getEmpresaId())
                    .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        }
        
        // Verificar título único (excluyendo el curso actual)
        if (!curso.getTitulo().equals(cursoDTO.getTitulo()) && 
            cursoRepository.existsByTituloAndEmpresaAndActivoTrueAndIdNot(cursoDTO.getTitulo(), empresa, id)) {
            throw new RuntimeException("Ya existe otro curso con ese título en la empresa");
        }
        
        curso.setTitulo(cursoDTO.getTitulo());
        curso.setDescripcion(cursoDTO.getDescripcion());
        curso.setEmpresa(empresa);
        curso = cursoRepository.save(curso);
        return mapToDTO(curso);
    }

    @Override
    public void eliminarCurso(Long id, Usuario usuario) {
        Curso curso = obtenerCursoConPermisos(id, usuario);
        curso.setActivo(false);
        cursoRepository.save(curso);
    }
    
    @Override
    @Transactional(readOnly = true)
    public CursoDTO obtenerCursoPorId(Long id, Usuario usuario) {
        Curso curso = obtenerCursoConPermisos(id, usuario);
        return mapToDTO(curso);
    }

    private void validarPermisosEmpresa(Usuario usuario) {
        if (usuario == null || usuario.getEmpresa() == null) {
            throw new IllegalArgumentException("Usuario sin empresa asignada");
        }
    }
    
    private Curso obtenerCursoConPermisos(Long id, Usuario usuario) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        if (!curso.getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            throw new RuntimeException("No tiene permiso para acceder a este curso");
        }
        
        return curso;
    }
    
    private CursoDTO mapToDTO(Curso curso) {
        // Contar módulos activos
        Long totalModulos = moduloRepository.countActivosByCursoId(curso.getId());
        
        // Contar estudiantes asignados
        Long totalEstudiantes = cursoUsuarioRepository.countByCursoId(curso.getId());
        
        return CursoDTO.builder()
                .id(curso.getId())
                .titulo(curso.getTitulo())
                .descripcion(curso.getDescripcion())
                .empresaId(curso.getEmpresa().getId())
                .nombreEmpresa(curso.getEmpresa().getNombre())
                .activo(curso.getActivo())
                .fechaCreacion(curso.getFechaCreacion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .totalModulos(totalModulos != null ? totalModulos.intValue() : 0)
                .totalEstudiantes(totalEstudiantes != null ? totalEstudiantes.intValue() : 0)
                .build();
    }
    
    private CursoResponse mapToResponse(Curso curso) {
        return CursoResponse.builder()
                .id(curso.getId())
                .titulo(curso.getTitulo())
                .descripcion(curso.getDescripcion())
                .empresaNombre(curso.getEmpresa().getNombre())
                .activo(curso.getActivo())
                .fechaCreacion(curso.getFechaCreacion())
                .build();
    }
}
