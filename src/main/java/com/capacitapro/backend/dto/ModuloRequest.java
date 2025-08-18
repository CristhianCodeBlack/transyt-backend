package com.capacitapro.backend.dto;

import lombok.Data;

@Data
public class ModuloRequest {
    private String titulo;
    private String contenido;
    private String tipo; // "VIDEO", "PDF", "TEXTO"
    private Integer orden;
    private Long cursoId;
}
