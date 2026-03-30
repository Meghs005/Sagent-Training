package com.example.parking_spot_finder.controller;

import com.example.parking_spot_finder.model.WalletTransaction;
import com.example.parking_spot_finder.service.WalletTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class WalletTransactionController {

    @Autowired
    private WalletTransactionService transactionService;

    @PostMapping
    public WalletTransaction addTransaction(@RequestBody WalletTransaction transaction) {
        return transactionService.saveTransaction(transaction);
    }

    @GetMapping
    public List<WalletTransaction> getAllTransactions() {
        return transactionService.getAllTransactions();
    }
}