package com.kentakitos.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private UsuarioDTO usuario;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioDTO {
        private Long id;
        private String username;
        private String nombreCompleto;
        private String email;
        private String fotoPerfil;
        private String rol;
        private String proveedor;
    }
}
