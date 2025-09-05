package com.capacitapro.backend.controller;

import com.capacitapro.backend.dto.*;
import com.capacitapro.backend.entity.Usuario;
import com.capacitapro.backend.repository.UsuarioRepository;
import com.capacitapro.backend.service.CursoService;
import com.capacitapro.backend.service.CursoAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
public class CursoController {

    private static final Logger log = LoggerFactory.getLogger(CursoController.class);

    private final CursoService cursoService;
    private final UsuarioRepository usuarioRepository;
    private final CursoAdminService cursoAdminService;

    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @GetMapping
    public ResponseEntity<List<CursoResponse>> listarCursos(Authentication authentication) {
        Usuario usuario = getUsuarioAutenticado(authentication);
        return ResponseEntity.ok(cursoService.listarCursosPorEmpresa(usuario));
    }

    @GetMapping("/dto")
    public ResponseEntity<List<CursoDTO>> listarCursosDTO(Authentication authentication) {
        Usuario usuario = getUsuarioAutenticado(authentication);
        return ResponseEntity.ok(cursoService.listarCursosDTO(usuario.getEmpresa().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoDTO> obtenerCurso(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = getUsuarioAutenticado(authentication);
        return ResponseEntity.ok(cursoService.obtenerCursoPorId(id, usuario));
    }

    @PostMapping
    public ResponseEntity<CursoDTO> crearCurso(@Valid @RequestBody CursoDTO cursoDTO, Authentication authentication) {
        try {
            log.info("Creando curso: {}", cursoDTO.getTitulo());
            log.debug("Usuario: {}", authentication.getName());
            
            Usuario usuario = getUsuarioAutenticado(authentication);
            log.debug("Usuario autenticado: {}, Empresa: {}", usuario.getNombre(), usuario.getEmpresa().getNombre());
            
            CursoDTO nuevoCurso = cursoService.crearCurso(cursoDTO, usuario);
            log.info("Curso creado exitosamente con ID: {}", nuevoCurso.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoCurso);
        } catch (Exception e) {
            log.error("Error al crear curso", e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoDTO> actualizarCurso(
            @PathVariable Long id,
            @Valid @RequestBody CursoDTO cursoDTO,
            Authentication authentication
    ) {
        try {
            log.info("Actualizando curso ID: {}", id);
            log.debug("Datos del curso: {}", cursoDTO.getTitulo());
            
            Usuario usuario = getUsuarioAutenticado(authentication);
            CursoDTO cursoActualizado = cursoService.actualizarCurso(id, cursoDTO, usuario);
            
            log.info("Curso actualizado exitosamente: {}", cursoActualizado.getId());
            return ResponseEntity.ok(cursoActualizado);
        } catch (Exception e) {
            log.error("Error al actualizar curso", e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCurso(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = getUsuarioAutenticado(authentication);
        cursoService.eliminarCurso(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        System.err.println("RuntimeException en CursoController: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.badRequest().body(e.getMessage());
    }
    
    @PostMapping("/{cursoId}/modulos")
    public ResponseEntity<java.util.Map<String, Object>> saveModulos(
            @PathVariable Long cursoId, 
            @RequestBody java.util.List<java.util.Map<String, Object>> modulosData,
            Authentication authentication) {
        try {
            java.util.Map<String, Object> result = cursoAdminService.saveModulos(cursoId, modulosData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error al guardar módulos: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @GetMapping("/{cursoId}/usuarios")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getUsuariosCurso(
            @PathVariable Long cursoId, Authentication authentication) {
        try {
            java.util.List<java.util.Map<String, Object>> usuarios = cursoAdminService.getUsuariosCurso(cursoId);
            return ResponseEntity.ok(usuarios);
        } catch (Exception e) {
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
    
    @GetMapping("/{cursoId}/instructor")
    public ResponseEntity<java.util.Map<String, Object>> getInstructorCurso(
            @PathVariable Long cursoId, Authentication authentication) {
        try {
            System.out.println("=== OBTENIENDO INSTRUCTOR CURSO ===" );
            System.out.println("CursoId: " + cursoId);
            
            java.util.Map<String, Object> instructor = cursoAdminService.getInstructorCurso(cursoId);
            System.out.println("Instructor encontrado: " + instructor);
            
            if (instructor != null) {
                return ResponseEntity.ok(instructor);
            } else {
                System.out.println("No se encontró instructor para el curso");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error obteniendo instructor: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{cursoId}/instructor/{instructorId}")
    public ResponseEntity<String> asignarInstructor(
            @PathVariable Long cursoId, 
            @PathVariable Long instructorId,
            Authentication authentication) {
        try {
            String result = cursoAdminService.asignarInstructor(cursoId, instructorId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al asignar instructor: " + e.getMessage());
        }
    }
    
    @PostMapping("/{cursoId}/usuarios/{usuarioId}")
    public ResponseEntity<String> asignarUsuario(
            @PathVariable Long cursoId, 
            @PathVariable Long usuarioId,
            Authentication authentication) {
        try {
            System.out.println("=== ASIGNANDO USUARIO A CURSO ===");
            System.out.println("CursoId: " + cursoId);
            System.out.println("UsuarioId: " + usuarioId);
            
            String result = cursoAdminService.asignarUsuario(usuarioId, cursoId);
            System.out.println("Resultado asignación: " + result);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("Error asignando usuario: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al asignar usuario: " + e.getMessage());
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        System.err.println("Exception en CursoController: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error interno del servidor: " + e.getMessage());
    }
}
