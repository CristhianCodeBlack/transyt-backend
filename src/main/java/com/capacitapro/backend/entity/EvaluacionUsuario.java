package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvaluacionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La evaluación es obligatoria")
    @ManyToOne
    @JoinColumn(name = "evaluacion_id")
    private Evaluacion evaluacion;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Min(value = 0, message = "El puntaje no puede ser negativo")
    @Max(value = 100, message = "El puntaje no puede ser mayor a 100")
    private Integer puntajeObtenido = 0;
    
    @Min(value = 0, message = "El puntaje máximo no puede ser negativo")
    private Integer puntajeMaximo;

    private Boolean aprobado = false;
    
    private Integer intentos = 1;
    
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaRealizacion = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        fechaInicio = LocalDateTime.now();
        fechaRealizacion = LocalDateTime.now();
    }
    
    public void calcularAprobacion() {
        if (evaluacion != null && puntajeMaximo != null && puntajeMaximo > 0) {
            double porcentaje = (puntajeObtenido.doubleValue() / puntajeMaximo.doubleValue()) * 100;
            this.aprobado = porcentaje >= evaluacion.getNotaMinima();
        }
    }
}
