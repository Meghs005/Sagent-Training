package com.example.grocery_tracking.service;

import com.example.grocery_tracking.model.Discount;
import com.example.grocery_tracking.repository.DiscountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiscountService {

    @Autowired
    private DiscountRepository discountRepository;

    // Create Discount
    public Discount saveDiscount(Discount discount) {
        return discountRepository.save(discount);
    }

    // Get All Discounts
    public List<Discount> getAllDiscounts() {
        return discountRepository.findAll();
    }

    // Delete Discount
    public void deleteDiscount(Long id) {
        discountRepository.deleteById(id);
    }
}
