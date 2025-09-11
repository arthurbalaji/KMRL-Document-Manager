package com.kmrl.document.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Backend is working"
        ));
    }

    @GetMapping("/auth")
    public ResponseEntity<?> testAuth(Authentication authentication) {
        if (authentication != null) {
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "user", authentication.getName(),
                "authorities", authentication.getAuthorities()
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                "authenticated", false,
                "message", "No authentication found"
            ));
        }
    }
}
