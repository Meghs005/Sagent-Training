package com.example.patient_monitoring_system.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "consultation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long aId;

    private String feedback;

    // Many consultations belong to one patient
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    // Many consultations belong to one doctor
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
}
