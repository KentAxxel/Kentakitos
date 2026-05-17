package com.kentakitos.restaurant.controller;

import com.kentakitos.restaurant.entity.Inventario;
import com.kentakitos.restaurant.repository.InventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    @Autowired
    private InventarioRepository inventarioRepository;

    @GetMapping
    public List<Inventario> listarInventario() {
        return inventarioRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> agregarItem(@RequestBody Inventario inventario) {
        if (inventarioRepository.findByIngrediente(inventario.getIngrediente()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El ingrediente ya existe en el inventario");
        }
        Inventario nuevoItem = inventarioRepository.save(inventario);
        return ResponseEntity.ok(nuevoItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarItem(@PathVariable Long id, @RequestBody Inventario inventarioActualizado) {
        Optional<Inventario> itemOpt = inventarioRepository.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item no encontrado");
        }

        Inventario itemExistente = itemOpt.get();
        itemExistente.setIngrediente(inventarioActualizado.getIngrediente());
        itemExistente.setCantidadDisponible(inventarioActualizado.getCantidadDisponible());
        itemExistente.setUnidadMedida(inventarioActualizado.getUnidadMedida());

        inventarioRepository.save(itemExistente);
        return ResponseEntity.ok(itemExistente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarItem(@PathVariable Long id) {
        if (!inventarioRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Item no encontrado");
        }
        inventarioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
