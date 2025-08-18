package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.dto.*;
import com.capacitapro.backend.entity.*;
import com.capacitapro.backend.repository.*;
import com.capacitapro.backend.service.ModuloService;
import com.capacitapro.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class ModuloServiceImpl implements ModuloService {

    private final ModuloRepository moduloRepository;
    private final CursoRepository cursoRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional(readOnly = true)
    public List<ModuloResponse> listarPorCurso(Long cursoId, Usuario usuario) {
        Curso curso = obtenerCursoConPermisos(cursoId, usuario);
        return moduloRepository.findByCursoAndActivoTrueOrderByOrden(curso)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ModuloDTO> listarModulosDTO(Long cursoId, Usuario usuario) {
        Curso curso = obtenerCursoConPermisos(cursoId, usuario);
        return moduloRepository.findByCursoAndActivoTrueOrderByOrden(curso)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ModuloDTO crear(ModuloDTO moduloDTO, Usuario usuario) {
        return crearModulo(moduloDTO, null, usuario);
    }
    
    public ModuloDTO crearConArchivo(ModuloDTO moduloDTO, MultipartFile archivo, Usuario usuario) {
        return crearModulo(moduloDTO, archivo, usuario);
    }
    
    private ModuloDTO crearModulo(ModuloDTO moduloDTO, MultipartFile archivo, Usuario usuario) {
        Curso curso = obtenerCursoConPermisos(moduloDTO.getCursoId(), usuario);
        
        // Validar que no existe un módulo con el mismo orden en el curso
        if (moduloRepository.existsByCursoAndOrdenAndActivoTrue(curso, moduloDTO.getOrden())) {
            throw new RuntimeException("Ya existe un módulo con ese orden en el curso");
        }
        
        // Validar contenido según tipo
        validarContenidoModulo(moduloDTO, archivo);
        
        Modulo modulo = Modulo.builder()
                .titulo(moduloDTO.getTitulo())
                .tipo(moduloDTO.getTipo())
                .orden(moduloDTO.getOrden())
                .curso(curso)
                .activo(true)
                .build();
        
        // Manejar contenido según tipo
        if ("TEXTO".equals(moduloDTO.getTipo())) {
            modulo.setContenido(moduloDTO.getContenido());
        } else if (archivo != null) {
            String nombreArchivo = fileStorageService.storeFile(archivo, moduloDTO.getTipo());
            modulo.setNombreArchivo(archivo.getOriginalFilename());
            modulo.setRutaArchivo(nombreArchivo);
            modulo.setTipoMime(archivo.getContentType());
            modulo.setTamanioArchivo(archivo.getSize());
        }

        modulo = moduloRepository.save(modulo);
        return mapToDTO(modulo);
    }

    @Override
    public ModuloDTO actualizar(Long id, ModuloDTO moduloDTO, Usuario usuario) {
        Modulo modulo = obtenerModuloConPermisos(id, usuario);
        
        // Validar orden único (excluyendo el módulo actual)
        if (!modulo.getOrden().equals(moduloDTO.getOrden()) &&
            moduloRepository.existsByCursoAndOrdenAndActivoTrueAndIdNot(modulo.getCurso(), moduloDTO.getOrden(), id)) {
            throw new RuntimeException("Ya existe otro módulo con ese orden en el curso");
        }
        
        modulo.setTitulo(moduloDTO.getTitulo());
        modulo.setContenido(moduloDTO.getContenido());
        modulo.setTipo(moduloDTO.getTipo());
        modulo.setOrden(moduloDTO.getOrden());

        modulo = moduloRepository.save(modulo);
        return mapToDTO(modulo);
    }

    @Override
    public void eliminar(Long id, Usuario usuario) {
        Modulo modulo = obtenerModuloConPermisos(id, usuario);
        modulo.setActivo(false);
        moduloRepository.save(modulo);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ModuloDTO obtenerPorId(Long id, Usuario usuario) {
        Modulo modulo = obtenerModuloConPermisos(id, usuario);
        return mapToDTO(modulo);
    }

    private Curso obtenerCursoConPermisos(Long cursoId, Usuario usuario) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        if (!curso.getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            throw new RuntimeException("No tiene acceso a este curso");
        }
        
        return curso;
    }
    
    private Modulo obtenerModuloConPermisos(Long id, Usuario usuario) {
        Modulo modulo = moduloRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
        
        if (!modulo.getCurso().getEmpresa().getId().equals(usuario.getEmpresa().getId())) {
            throw new RuntimeException("No tiene permiso para acceder a este módulo");
        }
        
        return modulo;
    }
    
    private void validarContenidoModulo(ModuloDTO moduloDTO, MultipartFile archivo) {
        if ("TEXTO".equals(moduloDTO.getTipo())) {
            if (moduloDTO.getContenido() == null || moduloDTO.getContenido().trim().isEmpty()) {
                throw new RuntimeException("El contenido es obligatorio para módulos de tipo TEXTO");
            }
        } else {
            if (archivo == null || archivo.isEmpty()) {
                throw new RuntimeException("El archivo es obligatorio para módulos de tipo " + moduloDTO.getTipo());
            }
        }
    }
    
    private ModuloDTO mapToDTO(Modulo modulo) {
        ModuloDTO dto = ModuloDTO.builder()
                .id(modulo.getId())
                .titulo(modulo.getTitulo())
                .contenido(modulo.getContenido())
                .tipo(modulo.getTipo())
                .orden(modulo.getOrden())
                .cursoId(modulo.getCurso().getId())
                .nombreCurso(modulo.getCurso().getTitulo())
                .activo(modulo.getActivo())
                .nombreArchivo(modulo.getNombreArchivo())
                .rutaArchivo(modulo.getRutaArchivo())
                .tipoMime(modulo.getTipoMime())
                .tamanioArchivo(modulo.getTamanioArchivo())
                .build();
        
        // Agregar URLs si tiene archivo
        if (modulo.getRutaArchivo() != null) {
            dto.setUrlDescarga("/api/modulos/" + modulo.getId() + "/archivo");
            
            // Determinar si puede tener preview
            boolean tienePreview = "PDF".equals(modulo.getTipo()) || 
                                 ("VIDEO".equals(modulo.getTipo()) && 
                                  modulo.getTipoMime() != null && 
                                  modulo.getTipoMime().startsWith("video/"));
            
            dto.setTienePreview(tienePreview);
            
            if (tienePreview) {
                dto.setUrlPreview("/api/modulos/" + modulo.getId() + "/preview");
            }
        } else {
            dto.setTienePreview(false);
        }
        
        return dto;
    }
    
    private ModuloResponse mapToResponse(Modulo modulo) {
        return ModuloResponse.builder()
                .id(modulo.getId())
                .titulo(modulo.getTitulo())
                .contenido(modulo.getContenido())
                .tipo(modulo.getTipo())
                .orden(modulo.getOrden())
                .cursoId(modulo.getCurso().getId())
                .cursoTitulo(modulo.getCurso().getTitulo())
                .build();
    }
}
