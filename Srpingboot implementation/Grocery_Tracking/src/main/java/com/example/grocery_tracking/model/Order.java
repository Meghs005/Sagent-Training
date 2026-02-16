package com.example.grocery_tracking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDate orderDate;
    private Double totalAmount;
}
