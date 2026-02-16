package com.example.patient_monitoring_system.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.patient_monitoring_system.model.HealthRecord;
import com.example.patient_monitoring_system.repository.HealthRecordRepository;

@Service
public class HealthRecordService {

    private final HealthRecordRepository repository;

    public HealthRecordService(HealthRecordRepository repository) {
        this.repository = repository;
    }

    public HealthRecord saveHealthRecord(HealthRecord record) {
        return repository.save(record);
    }

    public List<HealthRecord> getAllHealthRecords() {
        return repository.findAll();
    }

    public HealthRecord getHealthRecordById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteHealthRecord(Long id) {
        repository.deleteById(id);
    }
}
