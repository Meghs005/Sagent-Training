package com.example.grocery_tracking.controller;

import com.example.grocery_tracking.model.Product;
import com.example.grocery_tracking.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Create Product
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    // Get All Products
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // Get Product By Id
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    // Delete Product
    @DeleteMapping("/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return "Product deleted successfully";
    }
}
