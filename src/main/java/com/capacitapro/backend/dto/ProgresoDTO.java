package com.capacitapro.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgresoDTO {
    
    private Long usuarioId;
    private String nombreUsuario;
    private Long cursoId;
    private String nombreCurso;
    private Integer porcentajeProgreso;
    private Boolean completado;
    private String fechaInicio;
    private String fechaCompletado;
    private Integer modulosCompletados;
    private Integer totalModulos;
    private Integer evaluacionesAprobadas;
    private Integer totalEvaluaciones;
}