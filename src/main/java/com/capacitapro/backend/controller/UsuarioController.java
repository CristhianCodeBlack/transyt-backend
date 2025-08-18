package com.capacitapro.backend.controller;

import com.capacitapro.backend.dto.UsuarioDTO;
import com.capacitapro.backend.entity.Usuario;
import com.capacitapro.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/perfil")
    public ResponseEntity<Usuario> getPerfil(Authentication authentication) {
        String correo = authentication.getName();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(usuario);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<UsuarioDTO> usuariosDTO = usuarios.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(usuariosDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> getUsuarioById(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(convertToDTO(usuario));
    }

    @PostMapping
    public ResponseEntity<UsuarioDTO> createUsuario(@RequestBody Usuario usuario) {
        usuario.setClave(passwordEncoder.encode(usuario.getClave()));
        Usuario savedUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(convertToDTO(savedUsuario));
    }

    @PutMapping("/{id}")
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuarioRepository.delete(usuario);
        return ResponseEntity.ok().build();
    }

    private UsuarioDTO convertToDTO(Usuario usuario) {
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol())
                .activo(usuario.getActivo())
                .empresaId(usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null)
                .cursosAsignados(0) // TODO: Implementar conteo real
                .fechaCreacion("2024-01-01") // TODO: Agregar campo fecha en entidad
                .build();
    }
}
