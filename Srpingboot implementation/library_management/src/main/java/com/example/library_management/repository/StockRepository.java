package com.example.library_management.repository;

import com.example.library_management.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockRepository extends JpaRepository<Stock, Long> {

    // all books added by a user (because stock has user_id FK)
    List<Stock> findByUserUserId(Long userId);

    // optional helpers
    List<Stock> findByTitleContainingIgnoreCase(String title);
    List<Stock> findByAuthorContainingIgnoreCase(String author);
}
