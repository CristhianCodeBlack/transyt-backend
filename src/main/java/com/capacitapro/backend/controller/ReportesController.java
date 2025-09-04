package com.capacitapro.backend.controller;

import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor

public class ReportesController {

    private final CursoRepository cursoRepo;
    private final UsuarioRepository usuarioRepo;
    private final EvaluacionUsuarioRepository evaluacionUsuarioRepo;
    private final CertificadoRepository certificadoRepo;


    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepo.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getReportesDashboard(Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Long empresaId = usuario.getEmpresa().getId();
            
            // Estadísticas básicas
            List<Curso> cursos = cursoRepo.findByEmpresaId(empresaId);
            List<Usuario> usuarios = usuarioRepo.findByEmpresaId(empresaId);
            Long certificados = certificadoRepo.countActivosByEmpresaId(empresaId);
            
            // Progreso por curso (simplificado)
            List<Map<String, Object>> cursoProgreso = cursos.stream().map(curso -> {
                // Obtener evaluaciones del curso
                List<EvaluacionUsuario> evaluaciones = evaluacionUsuarioRepo
                        .findByEvaluacion_Curso_Empresa_IdOrderByFechaRealizacionDesc(empresaId)
                        .stream()
                        .filter(ev -> ev.getEvaluacion().getCurso().getId().equals(curso.getId()))
                        .collect(Collectors.toList());
                
                long completados = evaluaciones.stream()
                        .filter(EvaluacionUsuario::getAprobado)
                        .count();
                
                int progreso = evaluaciones.isEmpty() ? 0 : 
                    (int) ((completados * 100) / evaluaciones.size());
                
                Map<String, Object> item = new HashMap<>();
                item.put("curso", curso.getTitulo());
                item.put("progreso", progreso);
                item.put("inscritos", evaluaciones.size());
                item.put("completados", completados);
                return item;
            }).collect(Collectors.toList());
            
            // Actividad mensual
            List<EvaluacionUsuario> evaluacionesRecientes = evaluacionUsuarioRepo
                    .findByEvaluacion_Curso_Empresa_IdOrderByFechaRealizacionDesc(empresaId);
            
            long evaluacionesAprobadas = evaluacionesRecientes.stream()
                    .filter(EvaluacionUsuario::getAprobado)
                    .count();
            
            Map<String, Object> actividadMensual = new HashMap<>();
            actividadMensual.put("inscripciones", usuarios.size());
            actividadMensual.put("completados", evaluacionesAprobadas);
            actividadMensual.put("certificados", certificados);
            
            // Respuesta completa
            Map<String, Object> response = new HashMap<>();
            response.put("usuarios", usuarios.size());
            response.put("cursos", cursos.size());
            response.put("certificados", certificados);
            response.put("progreso", cursoProgreso.isEmpty() ? 0 : 
                cursoProgreso.stream().mapToInt(c -> (Integer) c.get("progreso")).sum() / cursoProgreso.size());
            response.put("cursoProgreso", cursoProgreso);
            response.put("actividadMensual", actividadMensual);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo reportes: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/usuarios")
    public ResponseEntity<Map<String, Object>> getReporteUsuarios(Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Long empresaId = usuario.getEmpresa().getId();
            
            List<Usuario> usuarios = usuarioRepo.findByEmpresaId(empresaId);
            long activos = usuarios.stream().filter(Usuario::getActivo).count();
            
            Map<String, Object> response = new HashMap<>();
            response.put("total", usuarios.size());
            response.put("activos", activos);
            response.put("inactivos", usuarios.size() - activos);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo reporte usuarios: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/cursos")
    public ResponseEntity<Map<String, Object>> getReporteCursos(Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Long empresaId = usuario.getEmpresa().getId();
            
            List<Curso> cursos = cursoRepo.findByEmpresaId(empresaId);
            long activos = cursos.stream().filter(Curso::getActivo).count();
            
            Map<String, Object> response = new HashMap<>();
            response.put("total", cursos.size());
            response.put("activos", activos);
            response.put("inactivos", cursos.size() - activos);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo reporte cursos: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/certificados")
    public ResponseEntity<Map<String, Object>> getReporteCertificados(Authentication authentication) {
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Long empresaId = usuario.getEmpresa().getId();
            
            Long certificados = certificadoRepo.countActivosByEmpresaId(empresaId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("total", certificados);
            response.put("activos", certificados);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error obteniendo reporte certificados: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
