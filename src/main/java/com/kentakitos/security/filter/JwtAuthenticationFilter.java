package com.kentakitos.security.filter;

import com.kentakitos.security.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.kentakitos.security.repository.UsuarioRepository;
import com.kentakitos.security.entity.Usuario;
import java.util.Optional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getUsernameFromToken(token);
                    
                    // Verificar si el token coincide con el activo en BD
                    Optional<Usuario> userOpt = usuarioRepository.findByUsername(username);
                    if (userOpt.isPresent()) {
                        Usuario u = userOpt.get();
                        if (token.equals(u.getTokenActual())) {
                            String rol = jwtUtil.getRolFromToken(token);

                            Collection<GrantedAuthority> authorities = new ArrayList<>();
                            if (rol != null && !rol.isEmpty()) {
                                authorities.add(new SimpleGrantedAuthority(rol));
                            }

                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            username,
                                            null,
                                            authorities
                                    );
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        } else {
                            logger.warn("Token rechazado por sesión inválida/reemplazada para " + username);
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("No se puede establecer autenticación de usuario", e);
        }

        filterChain.doFilter(request, response);
    }
}

