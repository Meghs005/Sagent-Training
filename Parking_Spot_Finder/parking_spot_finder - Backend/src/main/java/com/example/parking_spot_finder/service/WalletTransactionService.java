package com.example.parking_spot_finder.service;
import com.example.parking_spot_finder.model.WalletTransaction;
import com.example.parking_spot_finder.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WalletTransactionService {

    @Autowired
    private WalletTransactionRepository transactionRepository;

    public WalletTransaction saveTransaction(WalletTransaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<WalletTransaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}