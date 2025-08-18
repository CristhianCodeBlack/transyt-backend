package com.capacitapro.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDTO {
    
    private Long id;
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;
    
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe tener un formato válido")
    private String correo;
    
    @Size(min = 6, message = "La clave debe tener al menos 6 caracteres")
    private String clave;
    
    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "ADMIN|EMPLEADO|INSTRUCTOR", message = "El rol debe ser ADMIN, EMPLEADO o INSTRUCTOR")
    private String rol;
    
    private Long empresaId;
    
    private Boolean activo;
    
    private Integer cursosAsignados;
    
    private String fechaCreacion;
}