package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "curso_usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El curso es obligatorio")
    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private LocalDateTime fechaAsignacion = LocalDateTime.now();
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaCompletado;
    
    private Boolean completado = false;
    
    @Min(value = 0, message = "El progreso no puede ser negativo")
    @Max(value = 100, message = "El progreso no puede ser mayor a 100")
    private Integer porcentajeProgreso = 0;

    @PrePersist
    protected void onCreate() {
        fechaAsignacion = LocalDateTime.now();
    }
    
    public void iniciarCurso() {
        this.fechaInicio = LocalDateTime.now();
    }
    
    public void completarCurso() {
        this.completado = true;
        this.porcentajeProgreso = 100;
        this.fechaCompletado = LocalDateTime.now();
    }
}
