package com.example.patient_monitoring_system.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "patient")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pId;

    private String pName;
    private Integer pAge;
    private String pGender;
    private String pContact;

    // One patient can have many health records
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<HealthRecord> healthRecords;

    // One patient can have many consultations
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Consultation> consultations;

    // One patient can have many medical history records
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<MedicalHistory> medicalHistories;
}
