package com.example.patient_monitoring_system.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.patient_monitoring_system.model.Patient;
import com.example.patient_monitoring_system.repository.PatientRepository;

@Service
public class PatientService {

    private final PatientRepository repository;

    public PatientService(PatientRepository repository) {
        this.repository = repository;
    }

    public Patient savePatient(Patient patient) {
        return repository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return repository.findAll();
    }

    public Patient getPatientById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deletePatient(Long id) {
        repository.deleteById(id);
    }
}
