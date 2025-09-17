package com.capacitapro.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final LocalDateTime startTime = LocalDateTime.now();

    @GetMapping("/actuator/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("uptime", java.time.Duration.between(startTime, LocalDateTime.now()).getSeconds() + " seconds");
        health.put("service", "TRANSYT Backend");
        return ResponseEntity.ok(health);
    }

    @GetMapping("/api/health/quick")
    public ResponseEntity<String> quickHealth() {
        return ResponseEntity.ok("OK");
    }
}