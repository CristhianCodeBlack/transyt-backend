package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "inscripciones_evento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InscripcionEvento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Evento evento;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario usuario;
    
    @Enumerated(EnumType.STRING)
    private EstadoInscripcion estado = EstadoInscripcion.PENDIENTE;
    
    @Column(nullable = false)
    private LocalDateTime fechaInscripcion = LocalDateTime.now();
    
    private LocalDateTime fechaAprobacion;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aprobado_por")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario aprobadoPor;
    
    private String comentarios;
    
    public enum EstadoInscripcion {
        PENDIENTE, APROBADA, RECHAZADA, CANCELADA
    }
}