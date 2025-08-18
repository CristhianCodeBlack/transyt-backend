package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.dto.CertificadoDTO;
import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import com.capacitapro.backend.service.CertificadoService;
import com.capacitapro.backend.service.ProgresoService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CertificadoServiceImpl implements CertificadoService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CertificadoRepository certificadoRepository;
    private final ProgresoService progresoService;

    @Override
    @Transactional(readOnly = true)
    public List<CertificadoDTO> listarCertificadosUsuario(Usuario usuario) {
        List<Certificado> certificados = certificadoRepository.findByUsuarioAndActivoTrueOrderByFechaGeneracionDesc(usuario);
        return certificados.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificadoDTO> listarCertificadosEmpresa(Usuario admin) {
        if (!"ADMIN".equals(admin.getRol())) {
            throw new RuntimeException("Solo los administradores pueden ver todos los certificados");
        }
        
        List<Certificado> certificados = certificadoRepository.findByUsuario_EmpresaAndActivoTrueOrderByFechaGeneracionDesc(admin.getEmpresa());
        return certificados.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public CertificadoDTO generarCertificado(Long cursoId, Usuario usuario) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        if (!curso.getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            throw new RuntimeException("No tiene acceso a este curso");
        }
        
        // Verificar si ya existe un certificado
        Optional<Certificado> existente = certificadoRepository.findByUsuarioAndCursoAndActivoTrue(usuario, curso);
        if (existente.isPresent()) {
            return mapToDTO(existente.get());
        }
        
        // Verificar si puede generar certificado
        if (!progresoService.puedeGenerarCertificado(cursoId, usuario)) {
            throw new RuntimeException("Debe completar el curso y aprobar todas las evaluaciones para generar el certificado");
        }
        
        byte[] pdfBytes = generarCertificadoPdf(usuario, curso);
        
        Certificado certificado = Certificado.builder()
                .usuario(usuario)
                .curso(curso)
                .archivoPdf(pdfBytes)
                .activo(true)
                .build();
        
        certificado = certificadoRepository.save(certificado);
        return mapToDTO(certificado);
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayResource descargarCertificado(Long certificadoId, Usuario usuario) {
        Certificado certificado = certificadoRepository.findById(certificadoId)
                .orElseThrow(() -> new RuntimeException("Certificado no encontrado"));
        
        // Verificar permisos
        if (!certificado.getUsuario().getId().equals(usuario.getId()) && 
            !"ADMIN".equals(usuario.getRol())) {
            throw new RuntimeException("No tiene permisos para descargar este certificado");
        }
        
        if (!certificado.getActivo()) {
            throw new RuntimeException("El certificado no está disponible");
        }
        
        return new ByteArrayResource(certificado.getArchivoPdf());
    }

    @Override
    @Transactional(readOnly = true)
    public CertificadoDTO verificarCertificado(String codigoVerificacion) {
        Certificado certificado = certificadoRepository.findByCodigoVerificacionAndActivoTrue(codigoVerificacion)
                .orElseThrow(() -> new RuntimeException("Certificado no encontrado o código inválido"));
        
        return mapToDTO(certificado);
    }

    @Override
    public void revocarCertificado(Long certificadoId, Usuario admin) {
        if (!"ADMIN".equals(admin.getRol())) {
            throw new RuntimeException("Solo los administradores pueden revocar certificados");
        }
        
        Certificado certificado = certificadoRepository.findById(certificadoId)
                .orElseThrow(() -> new RuntimeException("Certificado no encontrado"));
        
        if (!certificado.getUsuario().getEmpresa().getId().equals(admin.getEmpresa().getId())) {
            throw new RuntimeException("No tiene permisos para revocar este certificado");
        }
        
        certificado.setActivo(false);
        certificadoRepository.save(certificado);
    }

    private byte[] generarCertificadoPdf(Usuario usuario, Curso curso) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate()); // Horizontal
            PdfWriter.getInstance(document, baos);
            document.open();

            // Fuentes
            Font titleFont = new Font(Font.HELVETICA, 28, Font.BOLD, new Color(0, 51, 102));
            Font subtitleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font nameFont = new Font(Font.HELVETICA, 24, Font.BOLD, new Color(0, 102, 204));
            Font courseFont = new Font(Font.HELVETICA, 20, Font.BOLD);
            Font textFont = new Font(Font.HELVETICA, 14);
            Font smallFont = new Font(Font.HELVETICA, 10, Font.ITALIC);

            // Espaciado
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // Título principal
            Paragraph title = new Paragraph("CERTIFICADO DE FINALIZACIÓN", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // Subtítulo
            Paragraph subtitle = new Paragraph("Se certifica que", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            document.add(new Paragraph(" "));

            // Nombre del usuario
            Paragraph name = new Paragraph(usuario.getNombre().toUpperCase(), nameFont);
            name.setAlignment(Element.ALIGN_CENTER);
            document.add(name);

            document.add(new Paragraph(" "));

            // Texto del curso
            Paragraph courseText = new Paragraph("ha completado satisfactoriamente el curso", textFont);
            courseText.setAlignment(Element.ALIGN_CENTER);
            document.add(courseText);

            document.add(new Paragraph(" "));

            // Nombre del curso
            Paragraph courseName = new Paragraph(curso.getTitulo(), courseFont);
            courseName.setAlignment(Element.ALIGN_CENTER);
            document.add(courseName);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // Información adicional
            Paragraph company = new Paragraph("Otorgado por: " + curso.getEmpresa().getNombre(), textFont);
            company.setAlignment(Element.ALIGN_CENTER);
            document.add(company);

            document.add(new Paragraph(" "));

            // Fecha
            String fecha = java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy"));
            Paragraph dateText = new Paragraph("Fecha de emisión: " + fecha, textFont);
            dateText.setAlignment(Element.ALIGN_CENTER);
            document.add(dateText);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error al generar el certificado PDF: " + e.getMessage(), e);
        }
    }

    private CertificadoDTO mapToDTO(Certificado certificado) {
        return CertificadoDTO.builder()
                .id(certificado.getId())
                .usuarioId(certificado.getUsuario().getId())
                .nombreUsuario(certificado.getUsuario().getNombre())
                .cursoId(certificado.getCurso().getId())
                .nombreCurso(certificado.getCurso().getTitulo())
                .fechaGeneracion(certificado.getFechaGeneracion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .codigoVerificacion(certificado.getCodigoVerificacion())
                .activo(certificado.getActivo())
                .build();
    }
}