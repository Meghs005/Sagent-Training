package com.example.grocery_tracking.controller;

import com.example.grocery_tracking.model.Discount;
import com.example.grocery_tracking.service.DiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discounts")
public class DiscountController {

    @Autowired
    private DiscountService discountService;

    // Create Discount
    @PostMapping
    public Discount createDiscount(@RequestBody Discount discount) {
        return discountService.saveDiscount(discount);
    }

    // Get All Discounts
    @GetMapping
    public List<Discount> getAllDiscounts() {
        return discountService.getAllDiscounts();
    }

    // Delete Discount
    @DeleteMapping("/{id}")
    public String deleteDiscount(@PathVariable Long id) {
        discountService.deleteDiscount(id);
        return "Discount deleted successfully";
    }
}
