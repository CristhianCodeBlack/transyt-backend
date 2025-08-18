package com.capacitapro.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RespuestaUsuarioRequest {
    private Long preguntaId;
    private Long respuestaId;
}
