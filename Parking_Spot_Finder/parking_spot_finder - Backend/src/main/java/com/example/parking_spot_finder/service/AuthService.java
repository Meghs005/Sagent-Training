package com.example.parking_spot_finder.service;

import com.example.parking_spot_finder.dto.LoginRequestDTO;
import com.example.parking_spot_finder.model.User;
import com.example.parking_spot_finder.repository.UserRepository;
import com.example.parking_spot_finder.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public String login(LoginRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail());

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (!user.getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getEmail());
    }
}