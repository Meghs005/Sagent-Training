package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Expenses;
import java.util.List;

public interface ExpensesService {

    Expenses createExpense(Expenses expense);

    List<Expenses> getAllExpenses();

    Expenses getExpenseById(int id);

    void deleteExpense(int id);
}
