package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class AsistenciaEnVivo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private CapacitacionEnVivo sesion;

    @ManyToOne
    private Usuario usuario;

    private LocalDateTime horaIngreso;
}
