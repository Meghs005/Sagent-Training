package com.example.parking_spot_finder.controller;

import com.example.parking_spot_finder.model.Wallet;
import com.example.parking_spot_finder.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wallets")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @PostMapping
    public Wallet addWallet(@RequestBody Wallet wallet) {
        return walletService.saveWallet(wallet);
    }

    @GetMapping
    public List<Wallet> getAllWallets() {
        return walletService.getAllWallets();
    }

    /* ── NEW: update wallet balance ── */
    @PutMapping("/{id}")
    public Wallet updateWallet(@PathVariable Long id, @RequestBody Wallet wallet) {
        wallet.setWalletId(id);
        return walletService.saveWallet(wallet);   // saveWallet calls repo.save() which handles both insert & update
    }
}
