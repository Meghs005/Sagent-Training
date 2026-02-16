package com.example.patient_monitoring_system.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.patient_monitoring_system.model.MedicalHistory;
import com.example.patient_monitoring_system.service.MedicalHistoryService;

@RestController
@RequestMapping("/medicalhistory")
public class MedicalHistoryController {

    private final MedicalHistoryService service;

    public MedicalHistoryController(MedicalHistoryService service) {
        this.service = service;
    }

    @PostMapping
    public MedicalHistory createMedicalHistory(@RequestBody MedicalHistory history) {
        return service.saveMedicalHistory(history);
    }

    @GetMapping
    public List<MedicalHistory> getAllMedicalHistories() {
        return service.getAllMedicalHistories();
    }

    @GetMapping("/{id}")
    public MedicalHistory getMedicalHistoryById(@PathVariable Long id) {
        return service.getMedicalHistoryById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteMedicalHistory(@PathVariable Long id) {
        service.deleteMedicalHistory(id);
        return "Medical History deleted successfully";
    }
}
