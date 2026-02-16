package com.example.budget_tracker.service;

import com.example.budget_tracker.model.Account;
import java.util.List;

public interface AccountService {

    Account createAccount(Account account);

    List<Account> getAllAccounts();

    Account getAccountById(int id);

    void deleteAccount(int id);
}
