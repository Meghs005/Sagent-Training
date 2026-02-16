package com.example.budget_tracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.budget_tracker.model.Budget;

public interface BudgetRepository extends JpaRepository<Budget, Integer> {
}
