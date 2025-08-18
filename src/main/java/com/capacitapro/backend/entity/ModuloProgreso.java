package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "modulo_progreso", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"usuario_id", "modulo_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloProgreso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @NotNull(message = "El módulo es obligatorio")
    @ManyToOne
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    private Boolean completado = false;
    
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaCompletado;
    
    @Min(value = 0, message = "El progreso no puede ser negativo")
    @Max(value = 100, message = "El progreso no puede ser mayor a 100")
    private Integer porcentajeProgreso = 0;

    @PrePersist
    protected void onCreate() {
        if (fechaInicio == null) {
            fechaInicio = LocalDateTime.now();
        }
        if (completado == null) {
            completado = false;
        }
        if (porcentajeProgreso == null) {
            porcentajeProgreso = 0;
        }
    }
    
    public void marcarCompletado() {
        this.completado = true;
        this.porcentajeProgreso = 100;
        this.fechaCompletado = LocalDateTime.now();
    }
}
