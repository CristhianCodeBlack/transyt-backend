package com.capacitapro.backend.event;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CursoCompletadoEvent {
    private Long cursoId;
    private Long usuarioId;
}