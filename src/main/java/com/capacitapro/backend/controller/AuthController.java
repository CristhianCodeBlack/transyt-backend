package com.capacitapro.backend.controller;

import com.capacitapro.backend.dto.LoginRequest;
import com.capacitapro.backend.dto.LoginResponse;
import com.capacitapro.backend.dto.RegisterRequest;
import com.capacitapro.backend.entity.Empresa;
import com.capacitapro.backend.entity.Usuario;
import com.capacitapro.backend.repository.UsuarioRepository;
import com.capacitapro.backend.repository.EmpresaRepository;
import com.capacitapro.backend.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "https://transyt-frontend.onrender.com"})
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getClave())
        );

        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        String token = jwtUtil.generateToken(usuario.getCorreo(), usuario.getRol());

        return ResponseEntity.ok(new LoginResponse(token, usuario.getRol(), usuario.getNombre()));
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (usuarioRepository.findByCorreo(request.getCorreo()).isPresent()) {
                return ResponseEntity.badRequest().body("Correo ya registrado");
            }

            Empresa empresa = empresaRepository.findById(request.getEmpresaId())
                    .orElse(null);
            
            if (empresa == null) {
                return ResponseEntity.badRequest().body("Empresa no encontrada con ID: " + request.getEmpresaId());
            }

            Usuario usuario = new Usuario();
            usuario.setCorreo(request.getCorreo());
            usuario.setClave(passwordEncoder.encode(request.getClave()));
            usuario.setNombre(request.getNombre());
            usuario.setRol(request.getRol());
            usuario.setEmpresa(empresa);
            usuario.setActivo(true);

            usuarioRepository.save(usuario);

            return ResponseEntity.ok("Usuario registrado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar usuario: " + e.getMessage());
        }
    }

}
