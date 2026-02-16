package com.example.grocery_tracking.controller;

import com.example.grocery_tracking.model.User;
import com.example.grocery_tracking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Create User
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    // Get All Users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get User By Id
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Delete User
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }
}
