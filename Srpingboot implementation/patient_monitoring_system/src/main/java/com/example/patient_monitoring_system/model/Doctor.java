package com.example.patient_monitoring_system.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "doctor")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dId;

    private String dName;
    private String dSpeciality;
    private Integer dExperience;
    private String dContact;

    // One doctor can have many consultations
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Consultation> consultations;

    // One doctor can have many medical history records
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<MedicalHistory> medicalHistories;
}
