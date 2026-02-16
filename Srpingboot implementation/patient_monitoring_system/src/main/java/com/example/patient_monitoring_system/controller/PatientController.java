package com.example.patient_monitoring_system.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.patient_monitoring_system.model.Patient;
import com.example.patient_monitoring_system.service.PatientService;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        return service.savePatient(patient);
    }

    @GetMapping
    public List<Patient> getAllPatients() {
        return service.getAllPatients();
    }

    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return service.getPatientById(id);
    }

    @DeleteMapping("/{id}")
    public String deletePatient(@PathVariable Long id) {
        service.deletePatient(id);
        return "Patient deleted successfully";
    }
}
