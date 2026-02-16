package com.example.library_management.repository;

import com.example.library_management.model.BookIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookIssueRepository extends JpaRepository<BookIssue, Long> {

    // issues done by a user/librarian (book_issue.user_id)
    List<BookIssue> findByUserUserId(Long userId);

    // issues of a particular book
    List<BookIssue> findByBookBookId(Long bookId);

    // filter by status
    List<BookIssue> findByStatus(String status);
}
