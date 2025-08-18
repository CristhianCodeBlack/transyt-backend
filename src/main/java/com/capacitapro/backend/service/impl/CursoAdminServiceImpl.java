package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import com.capacitapro.backend.entity.CursoInstructor;
import com.capacitapro.backend.repository.CursoInstructorRepository;
import com.capacitapro.backend.service.CursoAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class CursoAdminServiceImpl implements CursoAdminService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ModuloRepository moduloRepository;
    private final SubmoduloRepository submoduloRepository;
    private final SubmoduloProgresoRepository submoduloProgresoRepository;
    private final ModuloProgresoRepository moduloProgresoRepository;
    private final CursoUsuarioRepository cursoUsuarioRepository;
    private final CursoInstructorRepository cursoInstructorRepository;

    @Override
    public Map<String, Object> saveModulos(Long cursoId, List<Map<String, Object>> modulosData) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        // Eliminar módulos existentes y su progreso
        List<Modulo> modulosExistentes = moduloRepository.findByCursoOrderByOrdenAsc(curso);
        for (Modulo modulo : modulosExistentes) {
            // Limpiar progreso de submódulos
            List<Submodulo> submodulos = submoduloRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            for (Submodulo submodulo : submodulos) {
                submoduloProgresoRepository.deleteBySubmodulo(submodulo);
            }
            
            // Limpiar progreso del módulo
            moduloProgresoRepository.deleteByModulo(modulo);
            
            // Eliminar submódulos
            submoduloRepository.deleteByModuloId(modulo.getId());
        }
        moduloRepository.deleteAll(modulosExistentes);
        
        // Crear nuevos módulos
        for (Map<String, Object> moduloData : modulosData) {
            Modulo modulo = Modulo.builder()
                    .titulo((String) moduloData.get("titulo"))
                    .curso(curso)
                    .orden((Integer) moduloData.get("orden"))
                    .tipo("TEXTO")
                    .activo(true)
                    .build();
            
            Modulo savedModulo = moduloRepository.save(modulo);
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> submodulos = 
                (List<Map<String, Object>>) moduloData.get("submodulos");
            
            if (submodulos != null) {
                for (int i = 0; i < submodulos.size(); i++) {
                    Map<String, Object> submoduloData = submodulos.get(i);
                    
                    String titulo = (String) submoduloData.get("titulo");
                    if (titulo == null || titulo.trim().length() < 3) {
                        titulo = "Submódulo " + (i + 1);
                    }
                    if (titulo.length() > 200) {
                        titulo = titulo.substring(0, 200);
                    }
                    
                    Submodulo submodulo = Submodulo.builder()
                            .titulo(titulo)
                            .contenido((String) submoduloData.get("contenido"))
                            .tipo(((String) submoduloData.get("tipo")).toUpperCase())
                            .orden(i + 1)
                            .modulo(savedModulo)
                            .activo(true)
                            .build();
                    
                    @SuppressWarnings("unchecked")
                    Map<String, Object> archivo = 
                        (Map<String, Object>) submoduloData.get("archivo");
                    
                    if (archivo != null) {
                        submodulo.setNombreArchivo((String) archivo.get("name"));
                        submodulo.setRutaArchivo((String) archivo.get("filename"));
                        submodulo.setTipoMime((String) archivo.get("contentType"));
                        if (archivo.get("size") != null) {
                            submodulo.setTamanioArchivo(((Number) archivo.get("size")).longValue());
                        }
                    }
                    
                    submoduloRepository.save(submodulo);
                }
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Módulos guardados exitosamente");
        return response;
    }

    @Override
    public String asignarInstructor(Long cursoId, Long instructorId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        Usuario instructor = usuarioRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor no encontrado"));
        
        if (!"INSTRUCTOR".equals(instructor.getRol())) {
            throw new RuntimeException("El usuario debe tener rol de INSTRUCTOR");
        }
        
        // Eliminar instructor anterior si existe
        cursoInstructorRepository.deleteByCurso(curso);
        
        // Asignar nuevo instructor
        CursoInstructor cursoInstructor = CursoInstructor.builder()
                .curso(curso)
                .instructor(instructor)
                .build();
        
        cursoInstructorRepository.save(cursoInstructor);
        return "Instructor asignado exitosamente";
    }

    @Override
    public String asignarUsuario(Long usuarioId, Long cursoId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        if (cursoUsuarioRepository.findByCursoAndUsuario(curso, usuario).isPresent()) {
            throw new RuntimeException("El curso ya está asignado a este usuario");
        }
        
        CursoUsuario cursoUsuario = CursoUsuario.builder()
                .curso(curso)
                .usuario(usuario)
                .completado(false)
                .porcentajeProgreso(0)
                .build();
        
        cursoUsuarioRepository.save(cursoUsuario);
        return "Curso asignado exitosamente";
    }

    @Override
    public List<Map<String, Object>> getUsuariosCurso(Long cursoId) {
        List<CursoUsuario> cursosUsuario = cursoUsuarioRepository.findByCursoId(cursoId);
        
        return cursosUsuario.stream()
                .map(cu -> {
                    Map<String, Object> usuarioMap = new HashMap<>();
                    usuarioMap.put("id", cu.getUsuario().getId());
                    usuarioMap.put("nombre", cu.getUsuario().getNombre());
                    usuarioMap.put("correo", cu.getUsuario().getCorreo());
                    usuarioMap.put("rol", cu.getUsuario().getRol());
                    return usuarioMap;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Map<String, Object> getInstructorCurso(Long cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        return cursoInstructorRepository.findByCurso(curso)
                .map(ci -> {
                    Map<String, Object> instructorMap = new HashMap<>();
                    instructorMap.put("id", ci.getInstructor().getId());
                    instructorMap.put("nombre", ci.getInstructor().getNombre());
                    instructorMap.put("correo", ci.getInstructor().getCorreo());
                    instructorMap.put("rol", ci.getInstructor().getRol());
                    return instructorMap;
                })
                .orElse(null);
    }
}