package com.example.college_addmission.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;

    private String name;
    private String role;
    private String username;
    private String password;
    private int age;
}

