package com.capacitapro.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionDTO {
    
    private Long id;
    
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String titulo;
    
    private String descripcion;
    
    @NotNull(message = "El ID del curso es obligatorio")
    private Long cursoId;
    
    private String nombreCurso;
    
    @Min(value = 1, message = "La nota mínima debe ser mayor a 0")
    @Max(value = 100, message = "La nota mínima no puede ser mayor a 100")
    private Integer notaMinima;
    
    private Boolean activo;
    private String fechaCreacion;
    private List<PreguntaDTO> preguntas;
}