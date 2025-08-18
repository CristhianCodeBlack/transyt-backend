package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El enunciado es obligatorio")
    @Size(min = 10, max = 1000, message = "El enunciado debe tener entre 10 y 1000 caracteres")
    @Column(columnDefinition = "TEXT")
    private String enunciado;

    @Min(value = 1, message = "El puntaje debe ser mayor a 0")
    @Max(value = 10, message = "El puntaje no puede ser mayor a 10")
    private Integer puntaje = 1;
    
    @Column(name = "tipo", nullable = false)
    private String tipo = "multiple"; // "multiple" o "texto"
    
    @Column(name = "respuesta_esperada", columnDefinition = "TEXT")
    private String respuestaEsperada; // Para preguntas de texto

    @NotNull(message = "La evaluación es obligatoria")
    @ManyToOne
    @JoinColumn(name = "evaluacion_id")
    private Evaluacion evaluacion;

    @OneToMany(mappedBy = "pregunta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Respuesta> respuestas = new ArrayList<>();
}
