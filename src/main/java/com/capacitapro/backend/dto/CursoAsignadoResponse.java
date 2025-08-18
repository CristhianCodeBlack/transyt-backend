// CursoAsignadoResponse.java
package com.capacitapro.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CursoAsignadoResponse {
    private Long id;
    private Long cursoId;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaAsignacion;
    private Boolean completado;
    private Boolean iniciado;
    private Integer progreso;
}
