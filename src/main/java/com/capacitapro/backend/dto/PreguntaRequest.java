package com.capacitapro.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PreguntaRequest {
    private String enunciado;
    private int puntaje;
    private List<RespuestaRequest> respuestas;
}
