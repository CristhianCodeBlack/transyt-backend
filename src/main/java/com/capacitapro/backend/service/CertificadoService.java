package com.capacitapro.backend.service;

import com.capacitapro.backend.dto.CertificadoDTO;
import com.capacitapro.backend.entity.Usuario;
import org.springframework.core.io.ByteArrayResource;

import java.util.List;

public interface CertificadoService {
    List<CertificadoDTO> listarCertificadosUsuario(Usuario usuario);
    List<CertificadoDTO> listarCertificadosEmpresa(Usuario admin);
    CertificadoDTO generarCertificado(Long cursoId, Usuario usuario);
    ByteArrayResource descargarCertificado(Long certificadoId, Usuario usuario);
    CertificadoDTO verificarCertificado(String codigoVerificacion);
    void revocarCertificado(Long certificadoId, Usuario admin);
}