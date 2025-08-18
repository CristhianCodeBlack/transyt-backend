package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "modulo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Modulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String contenido; // Para tipo TEXTO

    @NotBlank(message = "El tipo es obligatorio")
    @Pattern(regexp = "VIDEO|PDF|TEXTO", message = "El tipo debe ser VIDEO, PDF o TEXTO")
    private String tipo;
    
    private String nombreArchivo; // Nombre original del archivo
    private String rutaArchivo;   // Ruta donde se guarda el archivo
    private String tipoMime;      // Tipo MIME del archivo
    private Long tamanioArchivo;  // Tamaño en bytes

    @NotNull(message = "El orden es obligatorio")
    @Min(value = 1, message = "El orden debe ser mayor a 0")
    private Integer orden;

    @NotNull(message = "El curso es obligatorio")
    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso;

    private Boolean activo = true;
}
