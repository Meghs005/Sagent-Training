package com.example.college_addmission.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.example.college_addmission.Model.FeesPayment;
import com.example.college_addmission.repository.FeesPaymentRepository;

@Service
public class FeesPaymentService {

    private final FeesPaymentRepository repo;

    public FeesPaymentService(FeesPaymentRepository repo) {
        this.repo = repo;
    }

    public FeesPayment save(FeesPayment payment) {
        return repo.save(payment);
    }

    public List<FeesPayment> getAll() {
        return repo.findAll();
    }

    public FeesPayment getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public FeesPayment update(Long id, FeesPayment payment) {
        payment.setFees_payment_id(id);
        return repo.save(payment);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
