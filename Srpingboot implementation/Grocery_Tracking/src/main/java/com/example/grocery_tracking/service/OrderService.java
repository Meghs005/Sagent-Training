package com.example.grocery_tracking.service;

import com.example.grocery_tracking.model.Order;
import com.example.grocery_tracking.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    // Create Order
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    // Get All Orders
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Delete Order
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
