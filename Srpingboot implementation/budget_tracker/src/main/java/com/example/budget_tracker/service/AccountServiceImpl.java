package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Account;
import com.example.budget_tracker.repository.AccountRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    public AccountServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public Account createAccount(Account account) {
        return accountRepository.save(account);
    }

    @Override
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Override
    public Account getAccountById(int id) {
        return accountRepository.findById(id).orElse(null);
    }

    @Override
    public void deleteAccount(int id) {
        accountRepository.deleteById(id);
    }
}

