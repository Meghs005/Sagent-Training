package com.example.patient_monitoring_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.patient_monitoring_system.model.HealthRecord;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {
}
