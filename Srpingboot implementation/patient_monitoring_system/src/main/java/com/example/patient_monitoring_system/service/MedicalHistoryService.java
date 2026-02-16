package com.example.patient_monitoring_system.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.patient_monitoring_system.model.MedicalHistory;
import com.example.patient_monitoring_system.repository.MedicalHistoryRepository;

@Service
public class MedicalHistoryService {

    private final MedicalHistoryRepository repository;

    public MedicalHistoryService(MedicalHistoryRepository repository) {
        this.repository = repository;
    }

    public MedicalHistory saveMedicalHistory(MedicalHistory history) {
        return repository.save(history);
    }

    public List<MedicalHistory> getAllMedicalHistories() {
        return repository.findAll();
    }

    public MedicalHistory getMedicalHistoryById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteMedicalHistory(Long id) {
        repository.deleteById(id);
    }
}
