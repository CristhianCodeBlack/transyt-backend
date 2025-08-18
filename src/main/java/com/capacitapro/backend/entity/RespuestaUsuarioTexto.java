package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RespuestaUsuarioTexto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La evaluación de usuario es obligatoria")
    @ManyToOne
    @JoinColumn(name = "evaluacion_usuario_id")
    private EvaluacionUsuario evaluacionUsuario;

    @NotNull(message = "La pregunta es obligatoria")
    @ManyToOne
    @JoinColumn(name = "pregunta_id")
    private Pregunta pregunta;

    @Column(columnDefinition = "TEXT")
    private String respuestaTexto;

    private Integer puntajeAsignado = 0;
    
    private Boolean revisada = false;
    
    @Column(columnDefinition = "TEXT")
    private String comentarioInstructor;
    
    private LocalDateTime fechaRevision;
    
    @ManyToOne
    @JoinColumn(name = "revisor_id")
    private Usuario revisor; // Admin o instructor que revisó
    
    private LocalDateTime fechaRespuesta = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        fechaRespuesta = LocalDateTime.now();
    }
}