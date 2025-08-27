package com.capacitapro.backend.event;

import com.capacitapro.backend.entity.Usuario;
import com.capacitapro.backend.repository.UsuarioRepository;
import com.capacitapro.backend.service.CertificadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CertificadoEventListener {

    private final CertificadoService certificadoService;
    private final UsuarioRepository usuarioRepository;

    @EventListener
    @Async
    public void handleCursoCompletado(CursoCompletadoEvent event) {
        try {
            Usuario usuario = usuarioRepository.findById(event.getUsuarioId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            certificadoService.generarCertificado(event.getCursoId(), usuario);
            System.out.println("✅ Certificado generado automáticamente para usuario ID: " + event.getUsuarioId());
            
        } catch (Exception e) {
            System.err.println("Error generando certificado automático: " + e.getMessage());
        }
    }
}