package com.example.library_management.controller;

import com.example.library_management.model.BookIssue;
import com.example.library_management.service.BookIssueService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class BookIssueController {

    private final BookIssueService bookIssueService;

    public BookIssueController(BookIssueService bookIssueService) {
        this.bookIssueService = bookIssueService;
    }

    // CREATE ISSUE
    @PostMapping
    public BookIssue createIssue(@RequestBody BookIssue issue) {
        return bookIssueService.createIssue(issue);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public BookIssue getIssueById(@PathVariable Long id) {
        return bookIssueService.getIssueById(id);
    }

    // GET ALL
    @GetMapping
    public List<BookIssue> getAllIssues() {
        return bookIssueService.getAllIssues();
    }

    // GET BY USER
    @GetMapping("/user/{userId}")
    public List<BookIssue> getIssuesByUser(@PathVariable Long userId) {
        return bookIssueService.getIssuesByUserId(userId);
    }

    // GET BY BOOK
    @GetMapping("/book/{bookId}")
    public List<BookIssue> getIssuesByBook(@PathVariable Long bookId) {
        return bookIssueService.getIssuesByBookId(bookId);
    }

    // GET BY STATUS
    @GetMapping("/status/{status}")
    public List<BookIssue> getIssuesByStatus(@PathVariable String status) {
        return bookIssueService.getIssuesByStatus(status);
    }

    // UPDATE
    @PutMapping("/{id}")
    public BookIssue updateIssue(@PathVariable Long id, @RequestBody BookIssue issue) {
        return bookIssueService.updateIssue(id, issue);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteIssue(@PathVariable Long id) {
        bookIssueService.deleteIssue(id);
    }
}
