package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Respuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El texto de la respuesta es obligatorio")
    @Size(min = 1, max = 500, message = "El texto debe tener entre 1 y 500 caracteres")
    @Column(columnDefinition = "TEXT")
    private String texto;

    @NotNull(message = "Debe especificar si es correcta")
    private Boolean esCorrecta = false;

    @NotNull(message = "La pregunta es obligatoria")
    @ManyToOne
    @JoinColumn(name = "pregunta_id")
    private Pregunta pregunta;
}
