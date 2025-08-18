package com.capacitapro.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Certificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @NotNull(message = "El curso es obligatorio")
    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso;

    private LocalDateTime fechaGeneracion = LocalDateTime.now();
    
    @NotBlank(message = "El código de verificación es obligatorio")
    @Column(unique = true)
    private String codigoVerificacion;
    
    private Boolean activo = true;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "archivo_pdf")
    private byte[] archivoPdf;
    
    @PrePersist
    protected void onCreate() {
        fechaGeneracion = LocalDateTime.now();
        if (codigoVerificacion == null) {
            codigoVerificacion = generarCodigoVerificacion();
        }
    }
    
    private String generarCodigoVerificacion() {
        return "CERT-" + System.currentTimeMillis() + "-" + 
               (int)(Math.random() * 9000 + 1000);
    }

}