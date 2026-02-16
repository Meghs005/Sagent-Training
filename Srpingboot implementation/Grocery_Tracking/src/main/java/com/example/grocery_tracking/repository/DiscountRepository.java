package com.example.grocery_tracking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.grocery_tracking.model.Discount;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {
}
