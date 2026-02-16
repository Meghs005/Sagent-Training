package com.example.budget_tracker.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Expenses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int eId;

    private String categoryExpense;
    private double dailyExpense;
    private double totalExpense;
    private double monthlyBalance;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
