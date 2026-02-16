package com.example.grocery_tracking.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long discountId;

    private String offerType;
    private Double percentage;
}
