package com.example.library_management.service;

import com.example.library_management.model.BookIssue;
import com.example.library_management.repository.BookIssueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookIssueService {

    private final BookIssueRepository bookIssueRepository;

    public BookIssueService(BookIssueRepository bookIssueRepository) {
        this.bookIssueRepository = bookIssueRepository;
    }

    public BookIssue createIssue(BookIssue issue) {
        return bookIssueRepository.save(issue);
    }

    public BookIssue getIssueById(Long id) {
        return bookIssueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + id));
    }

    public List<BookIssue> getAllIssues() {
        return bookIssueRepository.findAll();
    }

    public List<BookIssue> getIssuesByUserId(Long userId) {
        return bookIssueRepository.findByUserUserId(userId);
    }

    public List<BookIssue> getIssuesByBookId(Long bookId) {
        return bookIssueRepository.findByBookBookId(bookId);
    }

    public List<BookIssue> getIssuesByStatus(String status) {
        return bookIssueRepository.findByStatus(status);
    }

    public BookIssue updateIssue(Long id, BookIssue issue) {
        BookIssue existing = getIssueById(id);
        existing.setUser(issue.getUser());
        existing.setBook(issue.getBook());
        existing.setIssueDate(issue.getIssueDate());
        existing.setReturnDate(issue.getReturnDate());
        existing.setDueDate(issue.getDueDate());
        existing.setFineAmount(issue.getFineAmount());
        existing.setStatus(issue.getStatus());
        return bookIssueRepository.save(existing);
    }

    public void deleteIssue(Long id) {
        bookIssueRepository.deleteById(id);
    }
}
