package com.kentakitos.security.controller;

import com.kentakitos.security.entity.Rol;
import com.kentakitos.security.entity.Usuario;
import com.kentakitos.security.repository.RolRepository;
import com.kentakitos.security.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*") // Permite al frontend acceder a esta API
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {
        if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El nombre de usuario ya existe");
        }
        
        Optional<Rol> rolOpt = rolRepository.findById(usuario.getRol().getId());
        if(rolOpt.isEmpty()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El rol especificado no existe");
        }
        
        usuario.setRol(rolOpt.get());
        
        // Encriptar la contraseña antes de guardar
        if (usuario.getPassword() != null && !usuario.getPassword().trim().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        
        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(nuevoUsuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioActualizado) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }

        Usuario usuarioExistente = usuarioOpt.get();
        usuarioExistente.setNombreCompleto(usuarioActualizado.getNombreCompleto());
        usuarioExistente.setActivo(usuarioActualizado.getActivo());
        
        // Si se envió una nueva contraseña (y no está vacía)
        if(usuarioActualizado.getPassword() != null && !usuarioActualizado.getPassword().trim().isEmpty()){
            usuarioExistente.setPassword(passwordEncoder.encode(usuarioActualizado.getPassword()));
        }

        Optional<Rol> rolOpt = rolRepository.findById(usuarioActualizado.getRol().getId());
        if(rolOpt.isPresent()){
            usuarioExistente.setRol(rolOpt.get());
        }

        usuarioRepository.save(usuarioExistente);
        return ResponseEntity.ok(usuarioExistente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }
        // Eliminación física (podría ser lógica desactivando)
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
