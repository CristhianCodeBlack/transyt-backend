package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @Column(unique = true)
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo debe tener un formato válido")
    private String correo;

    @NotBlank(message = "La clave es obligatoria")
    @Size(min = 6, message = "La clave debe tener al menos 6 caracteres")
    private String clave;

    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "ADMIN|EMPLEADO|INSTRUCTOR", message = "El rol debe ser ADMIN, EMPLEADO o INSTRUCTOR")
    private String rol;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    private Boolean activo = true;
}
