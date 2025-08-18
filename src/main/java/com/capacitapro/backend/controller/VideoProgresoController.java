package com.capacitapro.backend.controller;

// DEPRECATED: Funcionalidad movida a ModuloProgresoController
// Este controlador será eliminado en futuras versiones

/*
@RestController
@RequestMapping("/api/video-progreso")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class VideoProgresoController {

    private final SubmoduloProgresoRepository submoduloProgresoRepo;
    private final SubmoduloRepository submoduloRepo;
    private final UsuarioRepository usuarioRepo;
    private final ModuloProgresoRepository moduloProgresoRepo;

    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String correo = authentication.getName();
        return usuarioRepo.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @PostMapping("/actualizar/{submoduloId}")
    public ResponseEntity<Map<String, Object>> actualizarProgreso(
            @PathVariable Long submoduloId,
            @RequestBody Map<String, Object> data,
            Authentication authentication) {
        
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Submodulo submodulo = submoduloRepo.findById(submoduloId)
                    .orElseThrow(() -> new RuntimeException("Submódulo no encontrado"));

            int tiempoVisto = ((Number) data.get("tiempoVisto")).intValue();
            int duracionTotal = ((Number) data.get("duracionTotal")).intValue();

            // Obtener o crear progreso
            SubmoduloProgreso progreso = submoduloProgresoRepo
                    .findByUsuarioAndSubmodulo(usuario, submodulo)
                    .orElse(SubmoduloProgreso.builder()
                            .usuario(usuario)
                            .submodulo(submodulo)
                            .build());

            progreso.actualizarProgreso(tiempoVisto, duracionTotal);
            submoduloProgresoRepo.save(progreso);

            // Actualizar progreso del módulo padre
            actualizarProgresoModulo(submodulo.getModulo(), usuario);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("porcentajeProgreso", progreso.getPorcentajeProgreso());
            response.put("completado", progreso.getCompletado());
            response.put("tiempoVisto", progreso.getTiempoVisto());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error actualizando progreso de video: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/obtener/{submoduloId}")
    public ResponseEntity<Map<String, Object>> obtenerProgreso(
            @PathVariable Long submoduloId,
            Authentication authentication) {
        
        try {
            Usuario usuario = getUsuarioAutenticado(authentication);
            Submodulo submodulo = submoduloRepo.findById(submoduloId)
                    .orElseThrow(() -> new RuntimeException("Submódulo no encontrado"));

            SubmoduloProgreso progreso = submoduloProgresoRepo
                    .findByUsuarioAndSubmodulo(usuario, submodulo)
                    .orElse(null);

            Map<String, Object> response = new HashMap<>();
            if (progreso != null) {
                response.put("tiempoVisto", progreso.getTiempoVisto());
                response.put("duracionTotal", progreso.getDuracionTotal());
                response.put("porcentajeProgreso", progreso.getPorcentajeProgreso());
                response.put("completado", progreso.getCompletado());
            } else {
                response.put("tiempoVisto", 0);
                response.put("duracionTotal", 0);
                response.put("porcentajeProgreso", 0);
                response.put("completado", false);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error obteniendo progreso de video: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private void actualizarProgresoModulo(Modulo modulo, Usuario usuario) {
        try {
            // Obtener progreso del módulo
            ModuloProgreso moduloProgreso = moduloProgresoRepo
                    .findByUsuarioAndModulo(usuario, modulo)
                    .orElse(ModuloProgreso.builder()
                            .usuario(usuario)
                            .modulo(modulo)
                            .build());

            // Calcular progreso basado en submódulos
            Double progresoPromedio = submoduloProgresoRepo
                    .getProgresoPromedioByUsuarioAndModulo(usuario, modulo);
            
            if (progresoPromedio != null) {
                moduloProgreso.setPorcentajeProgreso(progresoPromedio.intValue());
                
                // Marcar como completado si el progreso es >= 90%
                if (progresoPromedio >= 90 && !moduloProgreso.getCompletado()) {
                    moduloProgreso.marcarCompletado();
                }
                
                moduloProgresoRepo.save(moduloProgreso);
            }

        } catch (Exception e) {
            System.err.println("Error actualizando progreso del módulo: " + e.getMessage());
        }
    }
}*/