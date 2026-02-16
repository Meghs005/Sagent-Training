package com.example.library_management.repository;

import com.example.library_management.model.Notify;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotifyRepository extends JpaRepository<Notify, Long> {

    // notifications for a user
    List<Notify> findByUserUserId(Long userId);

    // notifications for a specific issue
    List<Notify> findByBookIssueBookIssueId(Long bookIssueId);
}
