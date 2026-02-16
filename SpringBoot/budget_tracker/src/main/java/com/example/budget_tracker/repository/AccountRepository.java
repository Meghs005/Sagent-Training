package com.example.budget_tracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.budget_tracker.model.Account;

public interface AccountRepository extends JpaRepository<Account, Integer> {
}

