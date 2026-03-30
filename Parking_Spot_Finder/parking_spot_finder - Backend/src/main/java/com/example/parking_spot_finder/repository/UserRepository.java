package com.example.parking_spot_finder.repository;

import com.example.parking_spot_finder.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    List<User> findByRole(String role);   // ← NEW: find admin by role
}
