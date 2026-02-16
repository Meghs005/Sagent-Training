package com.example.library_management.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "notify")
public class Notify {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(name = "sent_at", nullable = false)
    private LocalDate sentAt;

    // FK -> book_issue.book_issue_id
    @ManyToOne
    @JoinColumn(name = "book_issue_id", nullable = false)
    private BookIssue bookIssue;

    // FK -> users.user_id
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Notify() {}

    public Notify(Long id, String message, LocalDate sentAt, BookIssue bookIssue, User user) {
        this.id = id;
        this.message = message;
        this.sentAt = sentAt;
        this.bookIssue = bookIssue;
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDate getSentAt() { return sentAt; }
    public void setSentAt(LocalDate sentAt) { this.sentAt = sentAt; }

    public BookIssue getBookIssue() { return bookIssue; }
    public void setBookIssue(BookIssue bookIssue) { this.bookIssue = bookIssue; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
