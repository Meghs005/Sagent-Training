package com.example.budget_tracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.budget_tracker.model.User;

public interface UserRepository extends JpaRepository<User, Integer> {
}
