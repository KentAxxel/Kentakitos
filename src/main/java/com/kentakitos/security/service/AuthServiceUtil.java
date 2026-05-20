package com.kentakitos.security.service;

import com.kentakitos.security.dto.LoginResponse;
import com.kentakitos.security.entity.Usuario;

public class AuthServiceUtil {
    static LoginResponse buildLoginResponse(Usuario usuario, String token) {
        LoginResponse.UsuarioDTO usuarioDTO = new LoginResponse.UsuarioDTO(
            usuario.getId(),
            usuario.getUsername(),
            usuario.getNombreCompleto(),
            usuario.getEmail(),
            usuario.getFotoPerfil(),
            usuario.getRol().getNombre(),
            usuario.getProveedor()
        );
        return new LoginResponse(token, usuarioDTO);
    }
}
