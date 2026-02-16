package com.example.library_management.controller;

import com.example.library_management.model.Notify;
import com.example.library_management.service.NotifyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotifyController {

    private final NotifyService notifyService;

    public NotifyController(NotifyService notifyService) {
        this.notifyService = notifyService;
    }

    // CREATE
    @PostMapping
    public Notify createNotification(@RequestBody Notify notify) {
        return notifyService.createNotification(notify);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Notify getNotificationById(@PathVariable Long id) {
        return notifyService.getNotificationById(id);
    }

    // GET ALL
    @GetMapping
    public List<Notify> getAllNotifications() {
        return notifyService.getAllNotifications();
    }

    // GET BY USER
    @GetMapping("/user/{userId}")
    public List<Notify> getNotificationsByUser(@PathVariable Long userId) {
        return notifyService.getNotificationsByUserId(userId);
    }

    // GET BY ISSUE
    @GetMapping("/issue/{issueId}")
    public List<Notify> getNotificationsByIssue(@PathVariable Long issueId) {
        return notifyService.getNotificationsByIssueId(issueId);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Notify updateNotification(@PathVariable Long id, @RequestBody Notify notify) {
        return notifyService.updateNotification(id, notify);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteNotification(@PathVariable Long id) {
        notifyService.deleteNotification(id);
    }
}
