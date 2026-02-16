package com.example.patient_monitoring_system.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.patient_monitoring_system.model.Doctor;
import com.example.patient_monitoring_system.service.DoctorService;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService service;

    public DoctorController(DoctorService service) {
        this.service = service;
    }

    @PostMapping
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return service.saveDoctor(doctor);
    }

    @GetMapping
    public List<Doctor> getAllDoctors() {
        return service.getAllDoctors();
    }

    @GetMapping("/{id}")
    public Doctor getDoctorById(@PathVariable Long id) {
        return service.getDoctorById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteDoctor(@PathVariable Long id) {
        service.deleteDoctor(id);
        return "Doctor deleted successfully";
    }
}
