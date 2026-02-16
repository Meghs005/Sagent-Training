package com.example.grocery_tracking.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cartId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;
    private Double total;
}
