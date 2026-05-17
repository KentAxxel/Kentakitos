package com.kentakitos.restaurant.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventario")
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ingrediente; // Ej: Papas, Salchicha, Pan de hamburguesa

    @Column(nullable = false)
    private Double cantidadDisponible;

    @Column(nullable = false)
    private String unidadMedida; // Ej: KG, UNIDADES, LITROS

    public Inventario() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIngrediente() { return ingrediente; }
    public void setIngrediente(String ingrediente) { this.ingrediente = ingrediente; }

    public Double getCantidadDisponible() { return cantidadDisponible; }
    public void setCantidadDisponible(Double cantidadDisponible) { this.cantidadDisponible = cantidadDisponible; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }
}
