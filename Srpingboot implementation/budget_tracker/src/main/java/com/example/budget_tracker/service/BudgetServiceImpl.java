package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Budget;
import com.example.budget_tracker.repository.BudgetRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetServiceImpl(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @Override
    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    @Override
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    @Override
    public Budget getBudgetById(int id) {
        return budgetRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteBudget(int id) {
        budgetRepository.deleteById(id);
    }
}
