package com.example.parking_spot_finder.repository;

import com.example.parking_spot_finder.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Wallet findByUserUserId(Long userId);
}