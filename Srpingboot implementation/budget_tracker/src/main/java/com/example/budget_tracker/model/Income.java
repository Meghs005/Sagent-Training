package com.example.budget_tracker.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Income {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int iId;

    private String iType;
    private double amount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
