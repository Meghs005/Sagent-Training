package com.example.grocery_tracking.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deliveryId;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    private String deliveryStatus;
    private String deliveryAddress;
}
