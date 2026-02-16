package com.example.library_management.controller;

import com.example.library_management.model.Stock;
import com.example.library_management.service.StockService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    // ADD BOOK
    @PostMapping
    public Stock addBook(@RequestBody Stock stock) {
        return stockService.addBook(stock);
    }

    // GET BOOK BY ID
    @GetMapping("/{id}")
    public Stock getBookById(@PathVariable Long id) {
        return stockService.getBookById(id);
    }

    // GET ALL BOOKS
    @GetMapping
    public List<Stock> getAllBooks() {
        return stockService.getAllBooks();
    }

    // GET BOOKS BY USER
    @GetMapping("/user/{userId}")
    public List<Stock> getBooksByUser(@PathVariable Long userId) {
        return stockService.getBooksByUserId(userId);
    }

    // UPDATE BOOK
    @PutMapping("/{id}")
    public Stock updateBook(@PathVariable Long id, @RequestBody Stock stock) {
        return stockService.updateBook(id, stock);
    }

    // DELETE BOOK
    @DeleteMapping("/{id}")
    public void deleteBook(@PathVariable Long id) {
        stockService.deleteBook(id);
    }
}
