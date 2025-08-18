// AsignarCursoRequest.java
package com.capacitapro.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class AsignarCursoRequest {
    private Long cursoId;
    private List<Long> usuarioIds;
}
