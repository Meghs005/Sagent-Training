package com.example.grocery_tracking.service;

import com.example.grocery_tracking.model.Delivery;
import com.example.grocery_tracking.repository.DeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    // Create Delivery
    public Delivery saveDelivery(Delivery delivery) {
        return deliveryRepository.save(delivery);
    }

    // Get All Deliveries
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    // Delete Delivery
    public void deleteDelivery(Long id) {
        deliveryRepository.deleteById(id);
    }
}
