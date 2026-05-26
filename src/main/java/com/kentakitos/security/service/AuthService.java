package com.kentakitos.security.service;

import com.kentakitos.security.dto.LoginResponse;
import com.kentakitos.security.entity.Usuario;
import com.kentakitos.security.repository.UsuarioRepository;
import com.kentakitos.security.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse loginTraditional(String username, String password) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);

        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();

        boolean passwordMatches = passwordEncoder.matches(password, usuario.getPassword());

        if (!passwordMatches) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario inactivo");
        }

        // CONTROL DE SESIÓN ÚNICA
        if (usuario.getTokenActual() != null && !usuario.getTokenActual().trim().isEmpty()) {
            if (jwtUtil.validateToken(usuario.getTokenActual())) {
                throw new RuntimeException("Ya existe una sesión activa en otro navegador. Cierra sesión primero.");
            }
        }

        String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol().getNombre());
        
        // Guardar el nuevo token en la BD
        usuario.setTokenActual(token);
        usuarioRepository.save(usuario);
        
        return AuthServiceUtil.buildLoginResponse(usuario, token);
    }
}


