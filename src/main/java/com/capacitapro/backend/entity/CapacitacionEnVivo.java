package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "capacitacion_en_vivo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CapacitacionEnVivo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título es obligatorio")
    @Size(min = 3, max = 200, message = "El título debe tener entre 3 y 200 caracteres")
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDateTime fechaInicio;
    
    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDateTime fechaFin;

    private String enlaceTeams;
    private String meetingId;
    
    private Boolean activo = true;
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @NotNull(message = "El curso es obligatorio")
    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso;

    @NotNull(message = "El creador es obligatorio")
    @ManyToOne
    @JoinColumn(name = "creador_id")
    private Usuario creador;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        if (fechaFin != null && fechaInicio != null && fechaFin.isBefore(fechaInicio)) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }
    }
}

