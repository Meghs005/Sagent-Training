package com.example.grocery_tracking.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    private String name;
    private String category;
    private Double price;
    private Integer stock;
}
