package com.example.library_management.service;

import com.example.library_management.model.Stock;
import com.example.library_management.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    public Stock addBook(Stock stock) {
        return stockRepository.save(stock);
    }

    public Stock getBookById(Long id) {
        return stockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
    }

    public List<Stock> getAllBooks() {
        return stockRepository.findAll();
    }

    public List<Stock> getBooksByUserId(Long userId) {
        return stockRepository.findByUserUserId(userId);
    }

    public Stock updateBook(Long id, Stock stock) {
        Stock existing = getBookById(id);
        existing.setTitle(stock.getTitle());
        existing.setAuthor(stock.getAuthor());
        existing.setSubject(stock.getSubject());
        existing.setTotalQuantity(stock.getTotalQuantity());
        existing.setAvailableQuantity(stock.getAvailableQuantity());
        existing.setStatus(stock.getStatus());
        existing.setUser(stock.getUser());
        return stockRepository.save(existing);
    }

    public void deleteBook(Long id) {
        stockRepository.deleteById(id);
    }
}
