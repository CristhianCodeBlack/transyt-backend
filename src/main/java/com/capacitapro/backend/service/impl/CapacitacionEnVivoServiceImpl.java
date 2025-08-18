package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.dto.EventoTeams;
import com.capacitapro.backend.entity.CapacitacionEnVivo;
import com.capacitapro.backend.repository.CapacitacionEnVivoRepository;
import com.capacitapro.backend.service.CapacitacionEnVivoService;
import com.capacitapro.backend.service.GraphTeamsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CapacitacionEnVivoServiceImpl implements CapacitacionEnVivoService {

    private final CapacitacionEnVivoRepository capacitacionRepo;
    private final GraphTeamsService graphTeamsService;

    @Override
    public CapacitacionEnVivo crearConTeams(CapacitacionEnVivo capacitacion) {

        // Convertimos a un DTO para enviar al API Graph
        EventoTeams evento = new EventoTeams();
        evento.setSubject(capacitacion.getTitulo());
        evento.setBodyContent(capacitacion.getDescripcion());
        evento.setStart(capacitacion.getFechaInicio());
        evento.setEnd(capacitacion.getFechaFin());

        // Por ahora no tenemos correos de invitados, pero puedes añadir luego
        evento.setParticipantesEmails(Collections.emptyList());

        // Crear reunión en Microsoft Teams
        EventoTeams creado = graphTeamsService.crearReunionTeams(evento);

        // Asociar datos al objeto CapacitacionEnVivo
        capacitacion.setEnlaceTeams(creado.getMeetingLink());
        capacitacion.setMeetingId(creado.getMeetingId());

        // Guardar en base de datos
        return capacitacionRepo.save(capacitacion);
    }
}
