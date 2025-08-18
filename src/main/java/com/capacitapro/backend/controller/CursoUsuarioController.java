package com.capacitapro.backend.controller;

import com.capacitapro.backend.dto.AsignarCursoRequest;
import com.capacitapro.backend.dto.CursoAsignadoResponse;
import com.capacitapro.backend.entity.Usuario;
import com.capacitapro.backend.security.JwtUtil;
import com.capacitapro.backend.service.CursoUsuarioService;
import com.capacitapro.backend.service.impl.UsuarioServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/curso-usuario")
@RequiredArgsConstructor
public class CursoUsuarioController {

    private final CursoUsuarioService cursoUsuarioService;
    private final UsuarioServiceImpl usuarioService;

    @PostMapping("/asignar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> asignarUsuariosACurso(@RequestBody AsignarCursoRequest request) {
        cursoUsuarioService.asignarUsuariosACurso(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/mis-cursos")
    public ResponseEntity<List<CursoAsignadoResponse>> obtenerMisCursos(Principal principal) {
        Usuario usuario = usuarioService.getUsuarioFromPrincipal(principal);
        return ResponseEntity.ok(cursoUsuarioService.obtenerCursosAsignados(usuario));
    }
}
