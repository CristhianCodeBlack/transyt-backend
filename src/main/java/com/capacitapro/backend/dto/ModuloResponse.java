package com.capacitapro.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModuloResponse {
    private Long id;
    private String titulo;
    private String contenido;
    private String tipo;
    private Integer orden;
    private Long cursoId;
    private String cursoTitulo;
}
