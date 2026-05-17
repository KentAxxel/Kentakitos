package com.kentakitos.restaurant.controller;

import com.kentakitos.restaurant.entity.Producto;
import com.kentakitos.restaurant.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
        if (productoRepository.findByNombre(producto.getNombre()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El nombre del producto ya existe");
        }
        Producto nuevoProducto = productoRepository.save(producto);
        return ResponseEntity.ok(nuevoProducto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Producto productoActualizado) {
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Producto no encontrado");
        }

        Producto productoExistente = productoOpt.get();
        productoExistente.setNombre(productoActualizado.getNombre());
        productoExistente.setPrecioBase(productoActualizado.getPrecioBase());
        productoExistente.setCategoria(productoActualizado.getCategoria());

        productoRepository.save(productoExistente);
        return ResponseEntity.ok(productoExistente);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Producto no encontrado");
        }
        productoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
