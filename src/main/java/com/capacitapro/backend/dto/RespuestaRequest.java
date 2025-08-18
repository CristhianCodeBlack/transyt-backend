package com.capacitapro.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RespuestaRequest {
    private String texto;
    private boolean esCorrecta;
}
