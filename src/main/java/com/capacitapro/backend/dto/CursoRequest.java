package com.capacitapro.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CursoRequest {
    private String titulo;
    private String descripcion;
    private Long empresaId; // Solo necesario si el usuario es ADMIN y puede gestionar varias empresas
}
