package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Goal;
import java.util.List;

public interface GoalService {

    Goal createGoal(Goal goal);

    List<Goal> getAllGoals();

    Goal getGoalById(int id);

    void deleteGoal(int id);
}
