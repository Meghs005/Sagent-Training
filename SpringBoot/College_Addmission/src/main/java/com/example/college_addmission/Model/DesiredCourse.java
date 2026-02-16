package com.example.college_addmission.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Table(name = "desired_course")
public class DesiredCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long course_id;

    private String course_type;

    private String duration;
}
