package com.example.budget_tracker.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int bId;

    private String categoryType;
    private double bLimit;

    @ManyToOne
    @JoinColumn(name = "income_id")
    private Income income;
}
