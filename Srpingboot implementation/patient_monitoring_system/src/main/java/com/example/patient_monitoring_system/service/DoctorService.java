package com.example.patient_monitoring_system.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.patient_monitoring_system.model.Doctor;
import com.example.patient_monitoring_system.repository.DoctorRepository;

@Service
public class DoctorService {

    private final DoctorRepository repository;

    public DoctorService(DoctorRepository repository) {
        this.repository = repository;
    }

    public Doctor saveDoctor(Doctor doctor) {
        return repository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return repository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteDoctor(Long id) {
        repository.deleteById(id);
    }
}
