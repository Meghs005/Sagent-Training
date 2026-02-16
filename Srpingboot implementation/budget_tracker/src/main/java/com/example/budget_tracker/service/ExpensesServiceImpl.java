package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Expenses;
import com.example.budget_tracker.repository.ExpensesRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ExpensesServiceImpl implements ExpensesService {

    private final ExpensesRepository expensesRepository;

    public ExpensesServiceImpl(ExpensesRepository expensesRepository) {
        this.expensesRepository = expensesRepository;
    }

    @Override
    public Expenses createExpense(Expenses expense) {
        return expensesRepository.save(expense);
    }

    @Override
    public List<Expenses> getAllExpenses() {
        return expensesRepository.findAll();
    }

    @Override
    public Expenses getExpenseById(int id) {
        return expensesRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteExpense(int id) {
        expensesRepository.deleteById(id);
    }
}
