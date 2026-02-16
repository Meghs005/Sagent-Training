package com.example.patient_monitoring_system.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medical_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mId;

    // Many history records belong to one patient
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    // Many history records belong to one doctor
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    // Many history records refer to one health record
    @ManyToOne
    @JoinColumn(name = "health_record_id")
    private HealthRecord healthRecord;
}
