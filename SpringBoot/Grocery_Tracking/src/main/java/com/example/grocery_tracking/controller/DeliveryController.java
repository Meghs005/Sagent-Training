package com.example.grocery_tracking.controller;

import com.example.grocery_tracking.model.Delivery;
import com.example.grocery_tracking.service.DeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    // Create Delivery
    @PostMapping
    public Delivery createDelivery(@RequestBody Delivery delivery) {
        return deliveryService.saveDelivery(delivery);
    }

    // Get All Deliveries
    @GetMapping
    public List<Delivery> getAllDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    // Delete Delivery
    @DeleteMapping("/{id}")
    public String deleteDelivery(@PathVariable Long id) {
        deliveryService.deleteDelivery(id);
        return "Delivery deleted successfully";
    }
}
