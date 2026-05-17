package com.kentakitos.security.controller;

import com.kentakitos.security.dto.LoginRequest;
import com.kentakitos.security.entity.Usuario;
import com.kentakitos.security.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(loginRequest.getUsername());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // Validación SIMPLE (Texto plano) como fue solicitado temporalmente
            if (usuario.getPassword().equals(loginRequest.getPassword())) {
                if (!usuario.getActivo()) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Usuario inactivo");
                }
                return ResponseEntity.ok(usuario);
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas");
    }
}
