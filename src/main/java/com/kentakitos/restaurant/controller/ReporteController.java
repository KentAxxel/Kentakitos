package com.kentakitos.restaurant.controller;

import com.kentakitos.restaurant.repository.InventarioRepository;
import com.kentakitos.restaurant.repository.MesaRepository;
import com.kentakitos.restaurant.repository.ProductoRepository;
import com.kentakitos.security.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private MesaRepository mesaRepository;
    
    @Autowired
    private InventarioRepository inventarioRepository;
    
    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalUsuarios", usuarioRepository.count());
        stats.put("totalMesas", mesaRepository.count());
        stats.put("totalProductos", productoRepository.count());
        stats.put("totalIngredientes", inventarioRepository.count());
        
        // Aquí se podrían agregar cálculos de ventas, ingresos, etc.
        stats.put("ingresosMensuales", 14500.00); // Mock temporal

        return ResponseEntity.ok(stats);
    }
}
