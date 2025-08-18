package com.capacitapro.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoDTO {
    
    private Long id;
    
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String titulo;
    
    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 2000, message = "La descripción debe tener entre 10 y 2000 caracteres")
    private String descripcion;
    
    @NotNull(message = "El ID de empresa es obligatorio")
    private Long empresaId;
    
    private String nombreEmpresa;
    private Boolean activo;
    private String fechaCreacion;
    private Integer totalModulos;
    private Integer totalEstudiantes;
}