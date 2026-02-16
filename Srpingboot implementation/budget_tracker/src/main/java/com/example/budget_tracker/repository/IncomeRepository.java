package com.example.budget_tracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.budget_tracker.model.Income;

public interface IncomeRepository extends JpaRepository<Income, Integer> {
}
