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

        boolean passwordMatches = usuario.getPassword().startsWith("$2a$") || usuario.getPassword().startsWith("$2b$")
                ? passwordEncoder.matches(password, usuario.getPassword())
                : usuario.getPassword().equals(password);

        if (!passwordMatches) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario inactivo");
        }

        String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol().getNombre());
        return AuthServiceUtil.buildLoginResponse(usuario, token);
    }
}


