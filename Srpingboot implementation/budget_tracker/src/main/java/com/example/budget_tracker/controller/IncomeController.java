package com.example.budget_tracker.controller;

import com.example.budget_tracker.model.Income;
import com.example.budget_tracker.service.IncomeService;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/income")
public class IncomeController {

    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    @PostMapping
    public Income createIncome(@RequestBody Income income) {
        return incomeService.createIncome(income);
    }

    @GetMapping
    public List<Income> getAllIncome() {
        return incomeService.getAllIncome();
    }

    @GetMapping("/{id}")
    public Income getIncomeById(@PathVariable int id) {
        return incomeService.getIncomeById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteIncome(@PathVariable int id) {
        incomeService.deleteIncome(id);
        return "Income deleted successfully";
    }
}

