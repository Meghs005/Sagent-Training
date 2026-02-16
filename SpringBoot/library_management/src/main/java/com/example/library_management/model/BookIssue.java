package com.example.library_management.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "book_issue")
public class BookIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "book_issue_id")
    private Long bookIssueId;

    // FK -> users.user_id (librarian/admin who issued)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // FK -> stock.book_id
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Stock book;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "fine_amount")
    private Float fineAmount;

    @Column(nullable = false)
    private String status;

    public BookIssue() {}

    public BookIssue(Long bookIssueId, User user, Stock book,
                     LocalDate issueDate, LocalDate returnDate,
                     LocalDateTime dueDate, Float fineAmount, String status) {
        this.bookIssueId = bookIssueId;
        this.user = user;
        this.book = book;
        this.issueDate = issueDate;
        this.returnDate = returnDate;
        this.dueDate = dueDate;
        this.fineAmount = fineAmount;
        this.status = status;
    }

    public Long getBookIssueId() { return bookIssueId; }
    public void setBookIssueId(Long bookIssueId) { this.bookIssueId = bookIssueId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Stock getBook() { return book; }
    public void setBook(Stock book) { this.book = book; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Float getFineAmount() { return fineAmount; }
    public void setFineAmount(Float fineAmount) { this.fineAmount = fineAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
