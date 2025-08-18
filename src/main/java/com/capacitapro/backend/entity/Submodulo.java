package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "submodulo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submodulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    @NotBlank(message = "El tipo es obligatorio")
    @Pattern(regexp = "VIDEO|PDF|TEXTO|IMAGEN|EVALUACION", message = "El tipo debe ser VIDEO, PDF, TEXTO, IMAGEN o EVALUACION")
    private String tipo;
    
    private String nombreArchivo;
    private String rutaArchivo;
    private String tipoMime;
    private Long tamanioArchivo;

    @NotNull(message = "El orden es obligatorio")
    @Min(value = 1, message = "El orden debe ser mayor a 0")
    private Integer orden;

    @NotNull(message = "El módulo es obligatorio")
    @ManyToOne
    @JoinColumn(name = "modulo_id")
    private Modulo modulo;

    @Builder.Default
    private Boolean activo = true;
}