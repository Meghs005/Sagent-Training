package com.example.budget_tracker.controller;

import com.example.budget_tracker.model.Budget;
import com.example.budget_tracker.service.BudgetService;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public Budget createBudget(@RequestBody Budget budget) {
        return budgetService.createBudget(budget);
    }

    @GetMapping
    public List<Budget> getAllBudgets() {
        return budgetService.getAllBudgets();
    }

    @GetMapping("/{id}")
    public Budget getBudgetById(@PathVariable int id) {
        return budgetService.getBudgetById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteBudget(@PathVariable int id) {
        budgetService.deleteBudget(id);
        return "Budget deleted successfully";
    }
}
