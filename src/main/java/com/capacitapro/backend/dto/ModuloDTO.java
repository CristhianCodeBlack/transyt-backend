package com.capacitapro.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloDTO {
    
    private Long id;
    
    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String titulo;
    
    private String contenido; // Solo para tipo TEXTO
    
    @NotBlank(message = "El tipo es obligatorio")
    @Pattern(regexp = "VIDEO|PDF|TEXTO", message = "El tipo debe ser VIDEO, PDF o TEXTO")
    private String tipo;
    
    private String nombreArchivo;
    private String rutaArchivo;
    private String tipoMime;
    private Long tamanioArchivo;
    private String urlDescarga; // URL para descargar el archivo
    private String urlPreview;  // URL para vista previa del archivo
    private Boolean tienePreview; // Indica si el archivo puede previsualizarse
    
    @NotNull(message = "El orden es obligatorio")
    @Min(value = 1, message = "El orden debe ser mayor a 0")
    private Integer orden;
    
    @NotNull(message = "El ID del curso es obligatorio")
    private Long cursoId;
    
    private String nombreCurso;
    private Boolean activo;
}