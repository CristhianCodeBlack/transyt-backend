package com.capacitapro.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificadoDTO {
    
    private Long id;
    private Long usuarioId;
    private String nombreUsuario;
    private Long cursoId;
    private String nombreCurso;
    private String fechaGeneracion;
    private String codigoVerificacion;
    private Boolean activo;
}