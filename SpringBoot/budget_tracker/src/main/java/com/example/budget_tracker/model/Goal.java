package com.example.budget_tracker.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int gId;

    private double target;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}
