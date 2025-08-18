package com.capacitapro.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapacitacionEnVivoDTO {
    
    private Long id;
    
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String titulo;
    
    private String descripcion;
    
    @NotNull(message = "La fecha de inicio es obligatoria")
    private String fechaInicio;
    
    @NotNull(message = "La fecha de fin es obligatoria")
    private String fechaFin;
    
    @NotNull(message = "El ID del curso es obligatorio")
    private Long cursoId;
    
    private String nombreCurso;
    private String enlaceTeams;
    private String meetingId;
    private Boolean activo;
    private Long creadorId;
    private String nombreCreador;
}