package com.example.budget_tracker.controller;

import com.example.budget_tracker.model.Expenses;
import com.example.budget_tracker.service.ExpensesService;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/expenses")
public class ExpensesController {

    private final ExpensesService expensesService;

    public ExpensesController(ExpensesService expensesService) {
        this.expensesService = expensesService;
    }

    @PostMapping
    public Expenses createExpense(@RequestBody Expenses expense) {
        return expensesService.createExpense(expense);
    }

    @GetMapping
    public List<Expenses> getAllExpenses() {
        return expensesService.getAllExpenses();
    }

    @GetMapping("/{id}")
    public Expenses getExpenseById(@PathVariable int id) {
        return expensesService.getExpenseById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable int id) {
        expensesService.deleteExpense(id);
        return "Expense deleted successfully";
    }
}
