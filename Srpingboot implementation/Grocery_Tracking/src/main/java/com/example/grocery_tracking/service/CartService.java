package com.example.grocery_tracking.service;

import com.example.grocery_tracking.model.Cart;
import com.example.grocery_tracking.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    // Add to Cart
    public Cart saveCart(Cart cart) {
        return cartRepository.save(cart);
    }

    // Get All Cart Items
    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    // Delete Cart Item
    public void deleteCart(Long id) {
        cartRepository.deleteById(id);
    }
}
