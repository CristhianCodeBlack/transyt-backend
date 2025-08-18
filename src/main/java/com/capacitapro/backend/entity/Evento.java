package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "eventos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false)
    private LocalDateTime fechaInicio;
    
    @Column(nullable = false)
    private LocalDateTime fechaFin;
    
    private String ubicacion;
    
    private String instructor;
    
    private Integer maxAsistentes;
    
    private Integer asistentesActuales = 0;
    
    @Enumerated(EnumType.STRING)
    private TipoEvento tipo = TipoEvento.PRESENCIAL;
    
    @Enumerated(EnumType.STRING)
    private EstadoEvento estado = EstadoEvento.PROGRAMADO;
    
    private String enlaceVirtual;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario creadoPor;
    
    public enum TipoEvento {
        PRESENCIAL, VIRTUAL, HIBRIDO
    }
    
    public enum EstadoEvento {
        PROGRAMADO, EN_CURSO, COMPLETADO, CANCELADO
    }
}