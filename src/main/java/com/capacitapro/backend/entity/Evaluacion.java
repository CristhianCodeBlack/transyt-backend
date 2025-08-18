package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Evaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @NotNull(message = "El curso es obligatorio")
    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso;
    
    @ManyToOne
    @JoinColumn(name = "modulo_id")
    private Modulo modulo;

    private Boolean activo = true;

    @Min(value = 1, message = "La nota mínima debe ser mayor a 0")
    @Max(value = 100, message = "La nota mínima no puede ser mayor a 100")
    private Integer notaMinima = 70;

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @OneToMany(mappedBy = "evaluacion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Pregunta> preguntas = new ArrayList<>();
    
    @PostLoad
    private void initializeCollections() {
        if (preguntas == null) {
            preguntas = new ArrayList<>();
        }
    }

    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
