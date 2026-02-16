package com.example.grocery_tracking.service;

import com.example.grocery_tracking.model.Payment;
import com.example.grocery_tracking.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    // Create Payment
    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    // Get All Payments
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // Delete Payment
    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }
}
