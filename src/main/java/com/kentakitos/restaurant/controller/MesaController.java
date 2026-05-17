package com.kentakitos.restaurant.controller;

import com.kentakitos.restaurant.entity.Mesa;
import com.kentakitos.restaurant.repository.MesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "*")
public class MesaController {

    @Autowired
    private MesaRepository mesaRepository;

    @GetMapping
    public List<Mesa> listarMesas() {
        return mesaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> crearMesa(@RequestBody Mesa mesa) {
        if (mesaRepository.findByNumero(mesa.getNumero()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El número de mesa ya existe");
        }
        Mesa nuevaMesa = mesaRepository.save(mesa);
        return ResponseEntity.ok(nuevaMesa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarMesa(@PathVariable Long id, @RequestBody Mesa mesaActualizada) {
        Optional<Mesa> mesaOpt = mesaRepository.findById(id);
        if (mesaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Mesa no encontrada");
        }

        Mesa mesaExistente = mesaOpt.get();
        mesaExistente.setNumero(mesaActualizada.getNumero());
        mesaExistente.setCapacidad(mesaActualizada.getCapacidad());
        mesaExistente.setEstado(mesaActualizada.getEstado());

        mesaRepository.save(mesaExistente);
        return ResponseEntity.ok(mesaExistente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMesa(@PathVariable Long id) {
        if (!mesaRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Mesa no encontrada");
        }
        mesaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
