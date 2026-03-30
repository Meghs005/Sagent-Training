package com.example.parking_spot_finder.repository;

import com.example.parking_spot_finder.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    /** Find all transactions for a given wallet — used to compute real balance */
    List<WalletTransaction> findByWalletWalletId(Long walletId);
}
