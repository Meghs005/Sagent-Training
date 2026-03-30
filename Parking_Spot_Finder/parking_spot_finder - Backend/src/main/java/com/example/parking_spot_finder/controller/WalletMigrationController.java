package com.example.parking_spot_finder.controller;

import com.example.parking_spot_finder.service.WalletMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class WalletMigrationController {

    @Autowired
    private WalletMigrationService migrationService;

    /**
     * POST /admin/migrate-wallets
     * Scans all existing bookings and back-fills missing
     * lender credit + admin commission transactions.
     * Safe to call multiple times — already-processed bookings are skipped.
     */
    @PostMapping("/migrate-wallets")
    public Map<String, Object> migrateWallets() {
        return migrationService.runMigration();
    }
}
