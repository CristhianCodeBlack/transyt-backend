package com.capacitapro.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoResponse {
    private Long id;
    private String titulo;
    private String descripcion;
    private String empresaNombre;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
}
