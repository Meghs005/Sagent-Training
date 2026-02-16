package com.example.budget_tracker.controller;

import com.example.budget_tracker.model.Account;
import com.example.budget_tracker.service.AccountService;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountService.createAccount(account);
    }

    @GetMapping
    public List<Account> getAllAccounts() {
        return accountService.getAllAccounts();
    }

    @GetMapping("/{id}")
    public Account getAccountById(@PathVariable int id) {
        return accountService.getAccountById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteAccount(@PathVariable int id) {
        accountService.deleteAccount(id);
        return "Account deleted successfully";
    }
}
