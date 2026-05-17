package com.kentakitos.security.controller;

import com.kentakitos.security.entity.Permiso;
import com.kentakitos.security.repository.PermisoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/permisos")
@CrossOrigin(origins = "*")
public class PermisoController {

    @Autowired
    private PermisoRepository permisoRepository;

    @GetMapping
    public List<Permiso> listarPermisos() {
        return permisoRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> crearPermiso(@RequestBody Permiso permiso) {
        if (permisoRepository.findByNombre(permiso.getNombre()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El nombre del permiso ya existe");
        }
        Permiso nuevoPermiso = permisoRepository.save(permiso);
        return ResponseEntity.ok(nuevoPermiso);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPermiso(@PathVariable Long id, @RequestBody Permiso permisoActualizado) {
        Optional<Permiso> permisoOpt = permisoRepository.findById(id);
        if (permisoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Permiso no encontrado");
        }

        Permiso permisoExistente = permisoOpt.get();
        permisoExistente.setNombre(permisoActualizado.getNombre());

        permisoRepository.save(permisoExistente);
        return ResponseEntity.ok(permisoExistente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPermiso(@PathVariable Long id) {
        if (!permisoRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Permiso no encontrado");
        }
        // Nota: Eliminar un permiso asignado a roles fallará por integridad referencial
        // en una DB real a menos que se borre en cascada o se desvincule primero.
        try {
            permisoRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("No se puede eliminar el permiso porque está en uso por un Rol.");
        }
    }
}
