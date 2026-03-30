package com.example.parking_spot_finder.controller;

import com.example.parking_spot_finder.dto.LoginRequestDTO;
import com.example.parking_spot_finder.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/login")
    public String login(@RequestBody LoginRequestDTO dto) {
        return service.login(dto);
    }
}