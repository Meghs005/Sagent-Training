package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Goal;
import com.example.budget_tracker.repository.GoalRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;

    public GoalServiceImpl(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    @Override
    public Goal createGoal(Goal goal) {
        return goalRepository.save(goal);
    }

    @Override
    public List<Goal> getAllGoals() {
        return goalRepository.findAll();
    }

    @Override
    public Goal getGoalById(int id) {
        return goalRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteGoal(int id) {
        goalRepository.deleteById(id);
    }
}
