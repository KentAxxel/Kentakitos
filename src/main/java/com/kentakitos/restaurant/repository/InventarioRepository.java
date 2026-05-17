package com.kentakitos.restaurant.repository;

import com.kentakitos.restaurant.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    Optional<Inventario> findByIngrediente(String ingrediente);
}
