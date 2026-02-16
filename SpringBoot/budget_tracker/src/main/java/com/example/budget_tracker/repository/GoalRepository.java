package com.example.budget_tracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.budget_tracker.model.Goal;

public interface GoalRepository extends JpaRepository<Goal, Integer> {
}
