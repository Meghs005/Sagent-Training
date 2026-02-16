package com.example.patient_monitoring_system.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "health_record")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long hId;

    private String hType;
    private String hReadings;

    // Many health records belong to one patient
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}
