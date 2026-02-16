package com.example.library_management.service;

import com.example.library_management.model.Notify;
import com.example.library_management.repository.NotifyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotifyService {

    private final NotifyRepository notifyRepository;

    public NotifyService(NotifyRepository notifyRepository) {
        this.notifyRepository = notifyRepository;
    }

    public Notify createNotification(Notify notify) {
        return notifyRepository.save(notify);
    }

    public Notify getNotificationById(Long id) {
        return notifyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
    }

    public List<Notify> getAllNotifications() {
        return notifyRepository.findAll();
    }

    public List<Notify> getNotificationsByUserId(Long userId) {
        return notifyRepository.findByUserUserId(userId);
    }

    public List<Notify> getNotificationsByIssueId(Long issueId) {
        return notifyRepository.findByBookIssueBookIssueId(issueId);
    }

    public Notify updateNotification(Long id, Notify notify) {
        Notify existing = getNotificationById(id);
        existing.setMessage(notify.getMessage());
        existing.setSentAt(notify.getSentAt());
        existing.setUser(notify.getUser());
        existing.setBookIssue(notify.getBookIssue());
        return notifyRepository.save(existing);
    }

    public void deleteNotification(Long id) {
        notifyRepository.deleteById(id);
    }
}
