package com.capacitapro.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventoTeams {

    private String subject; // Título de la reunión
    private String bodyContent; // Descripción

    private LocalDateTime start;
    private LocalDateTime end;

    private List<String> participantesEmails; // Correos de los invitados

    private String meetingId;   // ID único de la reunión (devuelto por Teams)
    private String meetingLink; // Enlace a la reunión (joinUrl o onlineMeeting)

}
