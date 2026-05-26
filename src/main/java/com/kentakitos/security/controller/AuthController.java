package com.kentakitos.security.controller;

import com.kentakitos.security.dto.GoogleLoginRequest;
import com.kentakitos.security.dto.LoginRequest;
import com.kentakitos.security.dto.LoginResponse;
import com.kentakitos.security.service.AuthService;
import com.kentakitos.security.service.GoogleOAuth2Service;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.kentakitos.security.repository.UsuarioRepository;
import com.kentakitos.security.entity.Usuario;
import com.kentakitos.security.util.JwtUtil;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private GoogleOAuth2Service googleOAuth2Service;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.loginTraditional(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse(e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest googleLoginRequest) {
        try {
            LoginResponse response = googleOAuth2Service.authenticateWithGoogle(googleLoginRequest.getIdToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse(e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyToken() {
        return ResponseEntity.ok("{\"status\": \"valid\"}");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value="Authorization", required=false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String username = jwtUtil.getUsernameFromToken(token);
                java.util.Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
                if (usuarioOpt.isPresent()) {
                    Usuario usuario = usuarioOpt.get();
                    if (token.equals(usuario.getTokenActual())) {
                        usuario.setTokenActual(null);
                        usuarioRepository.save(usuario);
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors on logout
            }
        }
        return ResponseEntity.ok("{\"status\": \"logged_out\"}");
    }

    private Map<String, String> errorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}



