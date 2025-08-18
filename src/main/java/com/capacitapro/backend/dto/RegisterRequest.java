package com.capacitapro.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @Email
    @NotBlank
    private String correo;

    @NotBlank
    private String clave;

    @NotBlank
    private String nombre;

    @NotBlank
    private String rol; // ADMIN, EMPLEADO, etc.

    @NotNull
    private Long empresaId;
}
