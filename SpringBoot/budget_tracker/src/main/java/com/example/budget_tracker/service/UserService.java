package com.example.budget_tracker.service;

import com.example.budget_tracker.model.User;
import java.util.List;

public interface UserService {

    User createUser(User user);

    List<User> getAllUsers();

    User getUserById(int id);

    void deleteUser(int id);
}
