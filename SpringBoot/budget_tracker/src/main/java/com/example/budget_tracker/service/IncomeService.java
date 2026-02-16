package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Income;
import java.util.List;

public interface IncomeService {

    Income createIncome(Income income);

    List<Income> getAllIncome();

    Income getIncomeById(int id);

    void deleteIncome(int id);
}
