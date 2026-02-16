package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Income;
import com.example.budget_tracker.repository.IncomeRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;

    public IncomeServiceImpl(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    @Override
    public Income createIncome(Income income) {
        return incomeRepository.save(income);
    }

    @Override
    public List<Income> getAllIncome() {
        return incomeRepository.findAll();
    }

    @Override
    public Income getIncomeById(int id) {
        return incomeRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteIncome(int id) {
        incomeRepository.deleteById(id);
    }
}
