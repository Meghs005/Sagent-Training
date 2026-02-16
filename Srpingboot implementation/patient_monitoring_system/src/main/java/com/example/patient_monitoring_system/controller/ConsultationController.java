package com.example.patient_monitoring_system.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.patient_monitoring_system.model.Consultation;
import com.example.patient_monitoring_system.service.ConsultationService;

@RestController
@RequestMapping("/consultations")
public class ConsultationController {

    private final ConsultationService service;

    public ConsultationController(ConsultationService service) {
        this.service = service;
    }

    @PostMapping
    public Consultation createConsultation(@RequestBody Consultation consultation) {
        return service.saveConsultation(consultation);
    }

    @GetMapping
    public List<Consultation> getAllConsultations() {
        return service.getAllConsultations();
    }

    @GetMapping("/{id}")
    public Consultation getConsultationById(@PathVariable Long id) {
        return service.getConsultationById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteConsultation(@PathVariable Long id) {
        service.deleteConsultation(id);
        return "Consultation deleted successfully";
    }
}
