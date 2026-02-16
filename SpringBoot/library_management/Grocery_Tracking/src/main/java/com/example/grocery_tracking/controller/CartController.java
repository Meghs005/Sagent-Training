package com.example.grocery_tracking.controller;

import com.example.grocery_tracking.model.Cart;
import com.example.grocery_tracking.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/carts")
public class CartController {

    @Autowired
    private CartService cartService;

    // Add to Cart
    @PostMapping
    public Cart addToCart(@RequestBody Cart cart) {
        return cartService.saveCart(cart);
    }

    // Get All Cart Items
    @GetMapping
    public List<Cart> getAllCarts() {
        return cartService.getAllCarts();
    }

    // Delete Cart Item
    @DeleteMapping("/{id}")
    public String deleteCart(@PathVariable Long id) {
        cartService.deleteCart(id);
        return "Cart item deleted successfully";
    }
}
