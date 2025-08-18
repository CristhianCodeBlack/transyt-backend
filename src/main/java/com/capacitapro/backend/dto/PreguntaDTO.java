package com.capacitapro.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreguntaDTO {
    
    private Long id;
    
    @NotBlank(message = "El enunciado es obligatorio")
    @Size(min = 10, max = 1000, message = "El enunciado debe tener entre 10 y 1000 caracteres")
    private String enunciado;
    
    @Min(value = 1, message = "El puntaje debe ser mayor a 0")
    @Max(value = 10, message = "El puntaje no puede ser mayor a 10")
    private Integer puntaje;
    
    @NotNull(message = "El ID de evaluación es obligatorio")
    private Long evaluacionId;
    
    private String tipo = "multiple"; // "multiple" o "texto"
    
    private String respuestaEsperada; // Para preguntas de texto
    
    private List<RespuestaDTO> respuestas;
}