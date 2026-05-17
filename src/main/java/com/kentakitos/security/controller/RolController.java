package com.kentakitos.security.controller;

import com.kentakitos.security.entity.Rol;
import com.kentakitos.security.repository.PermisoRepository;
import com.kentakitos.security.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "*")
public class RolController {

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PermisoRepository permisoRepository;

    @GetMapping
    public List<Rol> listarRoles() {
        return rolRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> crearRol(@RequestBody Rol rol) {
        if (rolRepository.findByNombre(rol.getNombre()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El nombre del rol ya existe");
        }
        Rol nuevoRol = rolRepository.save(rol);
        return ResponseEntity.ok(nuevoRol);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarRol(@PathVariable Long id, @RequestBody Rol rolActualizado) {
        Optional<Rol> rolOpt = rolRepository.findById(id);
        if (rolOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Rol no encontrado");
        }

        Rol rolExistente = rolOpt.get();
        rolExistente.setNombre(rolActualizado.getNombre());
        
        // Actualizar permisos si se envían
        if (rolActualizado.getPermisos() != null) {
            rolExistente.setPermisos(rolActualizado.getPermisos());
        }

        rolRepository.save(rolExistente);
        return ResponseEntity.ok(rolExistente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRol(@PathVariable Long id) {
        if (!rolRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Rol no encontrado");
        }
        // Nota: Deberíamos verificar si hay usuarios usando este rol antes de borrarlo.
        rolRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
