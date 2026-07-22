package com.stayease.controller;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Simple liveness/info endpoints for load balancers and humans.
 */
@Hidden
@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
                "app", "StayEase API",
                "status", "UP",
                "docs", "/swagger-ui.html",
                "version", "1.0.0");
    }

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
