package com.capacitapro.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaDTO {
    
    private Long id;
    
    @NotBlank(message = "El texto de la respuesta es obligatorio")
    @Size(min = 1, max = 500, message = "El texto debe tener entre 1 y 500 caracteres")
    private String texto;
    
    @NotNull(message = "Debe especificar si es correcta")
    private Boolean esCorrecta;
    
    private Long preguntaId;
}