package com.capacitapro.backend.controller;

import com.capacitapro.backend.entity.Empresa;
import com.capacitapro.backend.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class EmpresaController {

    private final EmpresaRepository empresaRepository;

    @GetMapping
    public ResponseEntity<List<Empresa>> listarEmpresas() {
        List<Empresa> empresas = empresaRepository.findAll();
        return ResponseEntity.ok(empresas);
    }
}