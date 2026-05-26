package com.kentakitos.security.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kentakitos.security.dto.LoginResponse;
import com.kentakitos.security.entity.Rol;
import com.kentakitos.security.entity.Usuario;
import com.kentakitos.security.repository.RolRepository;
import com.kentakitos.security.repository.UsuarioRepository;
import com.kentakitos.security.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Optional;

@Service
public class GoogleOAuth2Service {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    public LoginResponse authenticateWithGoogle(String idToken) {
        try {
            GoogleTokenInfo tokenInfo = verifyGoogleToken(idToken);

            Optional<Usuario> usuarioOpt = usuarioRepository.findByGoogleId(tokenInfo.getSub());

            Usuario usuario;
            if (usuarioOpt.isPresent()) {
                usuario = usuarioOpt.get();
                if (!usuario.getActivo()) {
                    throw new RuntimeException("Usuario inactivo");
                }
            } else {
                usuario = createGoogleUser(tokenInfo);
            }

            // CONTROL DE SESIÓN ÚNICA
            if (usuario.getTokenActual() != null && !usuario.getTokenActual().trim().isEmpty()) {
                try {
                    if (jwtUtil.validateToken(usuario.getTokenActual())) {
                        throw new RuntimeException("Ya existe una sesión activa en otro navegador. Cierra sesión primero.");
                    }
                } catch (Exception e) {
                    // Token viejo expirado, ignorar
                }
            }

            String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRol().getNombre());
            
            // Guardar el token actual
            usuario.setTokenActual(token);
            usuarioRepository.save(usuario);
            
            return AuthServiceUtil.buildLoginResponse(usuario, token);

        } catch (Exception e) {
            throw new RuntimeException("Error autenticando con Google: " + e.getMessage());
        }
    }

    private GoogleTokenInfo verifyGoogleToken(String idToken) {
        String[] parts = idToken.split("\\.");
        if (parts.length != 3) {
            throw new RuntimeException("Formato de token inválido");
        }

        try {
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            JsonNode node = objectMapper.readTree(payload);

            validateTokenClaims(node);

            return new GoogleTokenInfo(
                node.get("sub").asText(),
                node.get("email").asText(),
                node.get("name").asText(),
                node.get("picture").asText()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error decodificando token: " + e.getMessage());
        }
    }

    private void validateTokenClaims(JsonNode node) {
        if (!node.has("iss") || !node.get("iss").asText().equals("https://accounts.google.com")) {
            throw new RuntimeException("Token issuer inválido");
        }
        if (!node.has("email")) {
            throw new RuntimeException("Token sin email");
        }
        long exp = node.get("exp").asLong();
        if (System.currentTimeMillis() / 1000 > exp) {
            throw new RuntimeException("Token expirado");
        }
    }

    private Usuario createGoogleUser(GoogleTokenInfo tokenInfo) {
        Optional<Rol> rolOpt = rolRepository.findByNombre("ROLE_USUARIO");
        if (rolOpt.isEmpty()) {
            Rol rol = new Rol();
            rol.setNombre("ROLE_USUARIO");
            rolRepository.save(rol);
            rolOpt = Optional.of(rol);
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(tokenInfo.getEmail().split("@")[0]);
        usuario.setEmail(tokenInfo.getEmail());
        usuario.setNombreCompleto(tokenInfo.getName());
        usuario.setGoogleId(tokenInfo.getSub());
        usuario.setFotoPerfil(tokenInfo.getPicture());
        usuario.setProveedor("GOOGLE");
        usuario.setPassword("OAUTH2");
        usuario.setRol(rolOpt.get());
        usuario.setActivo(true);

        return usuarioRepository.save(usuario);
    }

    private static class GoogleTokenInfo {
        private final String sub;
        private final String email;
        private final String name;
        private final String picture;

        GoogleTokenInfo(String sub, String email, String name, String picture) {
            this.sub = sub;
            this.email = email;
            this.name = name;
            this.picture = picture;
        }

        String getSub() { return sub; }
        String getEmail() { return email; }
        String getName() { return name; }
        String getPicture() { return picture; }
    }
}


