package com.example.patient_monitoring_system.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.patient_monitoring_system.model.Consultation;
import com.example.patient_monitoring_system.repository.ConsultationRepository;

@Service
public class ConsultationService {

    private final ConsultationRepository repository;

    public ConsultationService(ConsultationRepository repository) {
        this.repository = repository;
    }

    public Consultation saveConsultation(Consultation consultation) {
        return repository.save(consultation);
    }

    public List<Consultation> getAllConsultations() {
        return repository.findAll();
    }

    public Consultation getConsultationById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteConsultation(Long id) {
        repository.deleteById(id);
    }
}

