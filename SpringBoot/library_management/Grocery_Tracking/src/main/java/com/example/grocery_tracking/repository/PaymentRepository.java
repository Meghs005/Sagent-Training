package com.example.grocery_tracking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.grocery_tracking.model.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
