package com.example.patient_monitoring_system.controller;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.example.patient_monitoring_system.model.HealthRecord;
import com.example.patient_monitoring_system.service.HealthRecordService;

@RestController
@RequestMapping("/healthrecords")
public class HealthRecordController {

    private final HealthRecordService service;

    public HealthRecordController(HealthRecordService service) {
        this.service = service;
    }

    @PostMapping
    public HealthRecord createHealthRecord(@RequestBody HealthRecord record) {
        return service.saveHealthRecord(record);
    }

    @GetMapping
    public List<HealthRecord> getAllHealthRecords() {
        return service.getAllHealthRecords();
    }

    @GetMapping("/{id}")
    public HealthRecord getHealthRecordById(@PathVariable Long id) {
        return service.getHealthRecordById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteHealthRecord(@PathVariable Long id) {
        service.deleteHealthRecord(id);
        return "Health Record deleted successfully";
    }
}
