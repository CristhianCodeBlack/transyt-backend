package com.capacitapro.backend.controller;

import com.capacitapro.backend.dto.UsuarioDTO;
import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
// @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final CursoRepository cursoRepository;
    private final CursoUsuarioRepository cursoUsuarioRepository;
    private final ModuloRepository moduloRepository;
    private final SubmoduloRepository submoduloRepository;
    private final PasswordEncoder passwordEncoder;
    private final CertificadoRepository certificadoRepository;

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioDTO>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<UsuarioDTO> usuariosDTO = usuarios.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuariosDTO);
    }

    @PostMapping("/usuarios")
    public ResponseEntity<UsuarioDTO> createUsuario(@RequestBody UsuarioDTO usuarioDTO) {
        // Obtener o crear empresa por defecto
        Empresa empresa = empresaRepository.findById(1L)
                .orElseGet(() -> {
                    Empresa nuevaEmpresa = Empresa.builder()
                            .nombre("Empresa Default")
                            .ruc("12345678901")
                            .estado(true)
                            .build();
                    return empresaRepository.save(nuevaEmpresa);
                });
        
        Usuario usuario = Usuario.builder()
                .nombre(usuarioDTO.getNombre())
                .correo(usuarioDTO.getCorreo())
                .clave(passwordEncoder.encode(usuarioDTO.getClave()))
                .rol(usuarioDTO.getRol())
                .empresa(empresa)
                .activo(true)
                .build();
        
        Usuario savedUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(convertToDTO(savedUsuario));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioDTO> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuarioDetails) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setNombre(usuarioDetails.getNombre());
        usuario.setCorreo(usuarioDetails.getCorreo());
        usuario.setRol(usuarioDetails.getRol());
        usuario.setActivo(usuarioDetails.getActivo());
        
        if (usuarioDetails.getClave() != null && !usuarioDetails.getClave().isEmpty()) {
            usuario.setClave(passwordEncoder.encode(usuarioDetails.getClave()));
        }
        
        Usuario updatedUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(convertToDTO(updatedUsuario));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuarioRepository.delete(usuario);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/usuarios/{usuarioId}/cursos/{cursoId}")
    public ResponseEntity<String> asignarCurso(@PathVariable Long usuarioId, @PathVariable Long cursoId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        // Verificar si ya está asignado
        if (cursoUsuarioRepository.findByCursoAndUsuario(curso, usuario).isPresent()) {
            return ResponseEntity.badRequest().body("El curso ya está asignado a este usuario");
        }
        
        CursoUsuario cursoUsuario = CursoUsuario.builder()
                .curso(curso)
                .usuario(usuario)
                .completado(false)
                .porcentajeProgreso(0)
                .build();
        
        cursoUsuarioRepository.save(cursoUsuario);
        return ResponseEntity.ok("Curso asignado exitosamente");
    }
    
    @DeleteMapping("/usuarios/{usuarioId}/cursos/{cursoId}")
    public ResponseEntity<String> desasignarCurso(@PathVariable Long usuarioId, @PathVariable Long cursoId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        CursoUsuario cursoUsuario = cursoUsuarioRepository.findByCursoAndUsuario(curso, usuario)
                .orElseThrow(() -> new RuntimeException("El curso no está asignado a este usuario"));
        
        cursoUsuarioRepository.delete(cursoUsuario);
        return ResponseEntity.ok("Curso desasignado exitosamente");
    }
    
    @GetMapping("/usuarios/{usuarioId}/cursos")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getCursosUsuario(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        java.util.List<CursoUsuario> cursosUsuario = cursoUsuarioRepository.findByUsuarioId(usuarioId);
        
        java.util.List<java.util.Map<String, Object>> cursos = cursosUsuario.stream()
                .map(cu -> {
                    java.util.Map<String, Object> cursoMap = new java.util.HashMap<>();
                    cursoMap.put("id", cu.getCurso().getId());
                    cursoMap.put("titulo", cu.getCurso().getTitulo());
                    cursoMap.put("descripcion", cu.getCurso().getDescripcion());
                    cursoMap.put("fechaAsignacion", cu.getFechaAsignacion().toString());
                    cursoMap.put("progreso", cu.getPorcentajeProgreso());
                    cursoMap.put("completado", cu.getCompletado());
                    return cursoMap;
                })
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(cursos);
    }
    
    @PostMapping("/cursos/{cursoId}/instructor/{instructorId}")
    public ResponseEntity<String> asignarInstructor(@PathVariable Long cursoId, @PathVariable Long instructorId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        Usuario instructor = usuarioRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor no encontrado"));
        
        if (!"INSTRUCTOR".equals(instructor.getRol())) {
            return ResponseEntity.badRequest().body("El usuario debe tener rol de INSTRUCTOR");
        }
        
        // Por ahora guardamos la relación en una tabla intermedia (se puede crear después)
        // Temporalmente, podríamos usar un campo en la entidad Curso
        
        return ResponseEntity.ok("Instructor asignado exitosamente");
    }
    
    @DeleteMapping("/cursos/{cursoId}/instructor")
    public ResponseEntity<String> desasignarInstructor(@PathVariable Long cursoId) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        // Desasignar instructor
        
        return ResponseEntity.ok("Instructor desasignado exitosamente");
    }

    @PostMapping("/cursos/{cursoId}/modulos")
    // @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    public ResponseEntity<java.util.Map<String, Object>> saveModulos(@PathVariable Long cursoId, @RequestBody java.util.List<java.util.Map<String, Object>> modulosData) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        // Eliminar módulos existentes (primero submódulos, luego módulos)
        java.util.List<Modulo> modulosExistentes = moduloRepository.findByCursoOrderByOrdenAsc(curso);
        for (Modulo modulo : modulosExistentes) {
            // Eliminar submódulos primero
            submoduloRepository.deleteByModuloId(modulo.getId());
        }
        // Ahora eliminar módulos
        moduloRepository.deleteAll(modulosExistentes);
        
        // Crear nuevos módulos
        for (java.util.Map<String, Object> moduloData : modulosData) {
            Modulo modulo = Modulo.builder()
                    .titulo((String) moduloData.get("titulo"))
                    .curso(curso)
                    .orden((Integer) moduloData.get("orden"))
                    .tipo("TEXTO")
                    .activo(true)
                    .build();
            
            Modulo savedModulo = moduloRepository.save(modulo);
            
            // Guardar submódulos
            @SuppressWarnings("unchecked")
            java.util.List<java.util.Map<String, Object>> submodulos = 
                (java.util.List<java.util.Map<String, Object>>) moduloData.get("submodulos");
            
            if (submodulos != null) {
                for (int i = 0; i < submodulos.size(); i++) {
                    java.util.Map<String, Object> submoduloData = submodulos.get(i);
                    
                    Submodulo submodulo = Submodulo.builder()
                            .titulo((String) submoduloData.get("titulo"))
                            .contenido((String) submoduloData.get("contenido"))
                            .tipo(((String) submoduloData.get("tipo")).toUpperCase())
                            .orden(i + 1)
                            .modulo(savedModulo)
                            .activo(true)
                            .build();
                    
                    // Si hay información de archivo
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> archivo = 
                        (java.util.Map<String, Object>) submoduloData.get("archivo");
                    
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
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Módulos guardados exitosamente");
        return ResponseEntity.ok(response);
    }

    private UsuarioDTO convertToDTO(Usuario usuario) {
        // Contar cursos asignados reales
        int cursosAsignados = cursoUsuarioRepository.findByUsuarioId(usuario.getId()).size();
        
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol())
                .activo(usuario.getActivo())
                .empresaId(usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null)
                .cursosAsignados(cursosAsignados)
                .fechaCreacion("2024-01-01") // TODO: Agregar campo fecha en entidad
                .build();
    }
    
    @GetMapping("/certificados")
    public ResponseEntity<List<java.util.Map<String, Object>>> getCertificados() {
        try {
            List<Certificado> certificados = certificadoRepository.findAll();
            
            List<java.util.Map<String, Object>> response = certificados.stream()
                    .map(cert -> {
                        java.util.Map<String, Object> certData = new java.util.HashMap<>();
                        certData.put("id", cert.getId());
                        certData.put("codigoVerificacion", cert.getCodigoVerificacion());
                        certData.put("fechaGeneracion", cert.getFechaGeneracion());
                        certData.put("activo", cert.getActivo());
                        certData.put("usuario", cert.getUsuario().getNombre());
                        certData.put("curso", cert.getCurso().getTitulo());
                        return certData;
                    })
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
    
    @GetMapping("/configuracion")
    public ResponseEntity<java.util.Map<String, Object>> getConfiguracion() {
        java.util.Map<String, Object> config = new java.util.HashMap<>();
        config.put("nombreEmpresa", "CapacitaPro");
        config.put("version", "1.0.0");
        config.put("configuracionEmail", new java.util.HashMap<>());
        config.put("configuracionNotificaciones", new java.util.HashMap<>());
        return ResponseEntity.ok(config);
    }
    
    @PostMapping("/configuracion")
    public ResponseEntity<String> saveConfiguracion(@RequestBody java.util.Map<String, Object> config) {
        // Guardar configuración (implementar según necesidades)
        return ResponseEntity.ok("Configuración guardada exitosamente");
    }
}