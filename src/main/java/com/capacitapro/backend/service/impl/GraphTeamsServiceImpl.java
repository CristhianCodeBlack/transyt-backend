package com.capacitapro.backend.service.impl;

import com.capacitapro.backend.dto.EventoTeams;
import com.capacitapro.backend.service.GraphTeamsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GraphTeamsServiceImpl implements GraphTeamsService {

    @Value("${graph.tenant-id}")
    private String tenantId;

    @Value("${graph.client-id}")
    private String clientId;

    @Value("${graph.client-secret}")
    private String clientSecret;

    @Value("${graph.token-uri}")
    private String tokenUri;

    @Value("${graph.base-url}")
    private String graphBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public EventoTeams crearReunionTeams(EventoTeams evento) {
        String token = obtenerToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("subject", evento.getSubject());

        Map<String, String> bodyContent = new HashMap<>();
        bodyContent.put("contentType", "HTML");
        bodyContent.put("content", evento.getBodyContent());
        body.put("body", bodyContent);

        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
        Map<String, String> start = new HashMap<>();
        start.put("dateTime", evento.getStart().format(formatter));
        start.put("timeZone", "America/Lima");

        Map<String, String> end = new HashMap<>();
        end.put("dateTime", evento.getEnd().format(formatter));
        end.put("timeZone", "America/Lima");

        body.put("start", start);
        body.put("end", end);

        Map<String, Object> onlineMeetingSettings = new HashMap<>();
        onlineMeetingSettings.put("isOnlineMeeting", true);
        body.put("location", Map.of("displayName", "Microsoft Teams Meeting"));

        Map<String, Object> onlineMeeting = new HashMap<>();
        onlineMeeting.put("joinUrl", null);
        body.put("isOnlineMeeting", true);
        body.put("onlineMeetingProvider", "teamsForBusiness");

        // Participantes (solo para invitación opcional)
        List<Map<String, Object>> attendees = new ArrayList<>();
        for (String email : evento.getParticipantesEmails()) {
            Map<String, Object> attendee = new HashMap<>();
            attendee.put("emailAddress", Map.of("address", email));
            attendee.put("type", "required");
            attendees.add(attendee);
        }
        body.put("attendees", attendees);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        // Usar el correo real del usuario con licencia de Teams
        String teamsUserEmail = "transytti@transytlogistics.com";
        String url = graphBaseUrl + "/users/" + teamsUserEmail + "/events";

        try {
            System.out.println("=== CREANDO REUNIÓN EN TEAMS ===");
            System.out.println("URL: " + url);
            System.out.println("Body: " + body);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            
            System.out.println("Respuesta Teams: " + response.getStatusCode());
            System.out.println("Body respuesta: " + response.getBody());

            if (response.getStatusCode() == HttpStatus.CREATED || response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();

                evento.setMeetingId((String) responseBody.get("id"));

                Map<String, Object> onlineMeetingResp = (Map<String, Object>) responseBody.get("onlineMeeting");
                if (onlineMeetingResp != null) {
                    evento.setMeetingLink((String) onlineMeetingResp.get("joinUrl"));
                    System.out.println("✅ Reunión creada exitosamente: " + evento.getMeetingLink());
                } else {
                    System.out.println("⚠️ No se generó enlace de Teams en la respuesta");
                }

                return evento;
            } else {
                throw new RuntimeException("Error al crear reunión en Microsoft Teams: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Error en GraphTeamsService: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private String obtenerToken() {
        System.out.println("=== OBTENIENDO TOKEN DE MICROSOFT GRAPH ===");
        System.out.println("Tenant ID: " + tenantId);
        System.out.println("Client ID: " + clientId);
        System.out.println("Token URI: " + tokenUri);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        Map<String, String> params = new LinkedHashMap<>();
        params.put("client_id", clientId);
        params.put("scope", "https://graph.microsoft.com/.default");
        params.put("client_secret", clientSecret);
        params.put("grant_type", "client_credentials");

        StringBuilder body = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (body.length() > 0) body.append("&");
            body.append(entry.getKey()).append("=").append(entry.getValue());
        }

        HttpEntity<String> request = new HttpEntity<>(body.toString(), headers);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(tokenUri, HttpMethod.POST, request, Map.class);
            
            System.out.println("Respuesta token: " + response.getStatusCode());
            
            if (response.getStatusCode().is2xxSuccessful()) {
                String token = (String) response.getBody().get("access_token");
                System.out.println("✅ Token obtenido exitosamente");
                return token;
            } else {
                System.err.println("Error obteniendo token: " + response.getBody());
                throw new RuntimeException("Error al obtener token: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("Excepción obteniendo token: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
