package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "submodulo_progreso", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"usuario_id", "submodulo_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmoduloProgreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "submodulo_id")
    private Submodulo submodulo;

    @Column(name = "tiempo_visto")
    private Integer tiempoVisto = 0; // En segundos

    @Column(name = "duracion_total")
    private Integer duracionTotal = 0; // En segundos

    @Column(name = "porcentaje_progreso")
    private Integer porcentajeProgreso = 0;

    @Column(name = "completado")
    private Boolean completado = false;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_completado")
    private LocalDateTime fechaCompletado;

    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (fechaInicio == null) {
            fechaInicio = LocalDateTime.now();
        }
        ultimaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ultimaActualizacion = LocalDateTime.now();
        
        // Marcar como completado si se vio más del 90%
        if (duracionTotal > 0 && tiempoVisto != null && tiempoVisto >= (duracionTotal * 0.9)) {
            completado = true;
            if (fechaCompletado == null) {
                fechaCompletado = LocalDateTime.now();
            }
        }
        
        // Calcular porcentaje
        if (duracionTotal > 0 && tiempoVisto != null) {
            porcentajeProgreso = Math.min((tiempoVisto * 100) / duracionTotal, 100);
        }
    }

    public void actualizarProgreso(int tiempoVisto, int duracionTotal) {
        this.tiempoVisto = Math.max(this.tiempoVisto != null ? this.tiempoVisto : 0, tiempoVisto);
        this.duracionTotal = duracionTotal;
        onUpdate();
    }
}