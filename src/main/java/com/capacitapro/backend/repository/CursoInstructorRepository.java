package com.capacitapro.backend.repository;

import com.capacitapro.backend.entity.CursoInstructor;
import com.capacitapro.backend.entity.Curso;
import com.capacitapro.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CursoInstructorRepository extends JpaRepository<CursoInstructor, Long> {
    Optional<CursoInstructor> findByCurso(Curso curso);
    Optional<CursoInstructor> findByCursoAndInstructor(Curso curso, Usuario instructor);
    void deleteByCurso(Curso curso);
}