package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Budget;
import java.util.List;

public interface BudgetService {

    Budget createBudget(Budget budget);

    List<Budget> getAllBudgets();

    Budget getBudgetById(int id);

    void deleteBudget(int id);
}
