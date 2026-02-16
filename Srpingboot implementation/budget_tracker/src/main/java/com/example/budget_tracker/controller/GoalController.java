package com.example.budget_tracker.controller;

import com.example.budget_tracker.model.Goal;
import com.example.budget_tracker.service.GoalService;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public Goal createGoal(@RequestBody Goal goal) {
        return goalService.createGoal(goal);
    }

    @GetMapping
    public List<Goal> getAllGoals() {
        return goalService.getAllGoals();
    }

    @GetMapping("/{id}")
    public Goal getGoalById(@PathVariable int id) {
        return goalService.getGoalById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteGoal(@PathVariable int id) {
        goalService.deleteGoal(id);
        return "Goal deleted successfully";
    }
}
