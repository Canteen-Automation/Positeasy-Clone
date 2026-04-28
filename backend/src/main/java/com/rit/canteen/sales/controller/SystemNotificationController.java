package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.SystemNotification;
import com.rit.canteen.sales.service.SystemNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class SystemNotificationController {

    @Autowired
    private SystemNotificationService notificationService;

    @GetMapping("/test")
    public String testReachability() {
        return "Notification API is Reachable and whitelisted!";
    }

    @GetMapping
    public List<SystemNotification> getUnread() {
        try {
            return notificationService.getUnreadNotifications();
        } catch (Exception e) {
            System.err.println("[CRITICAL] Failed to fetch unread notifications:");
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/all")
    public List<SystemNotification> getAll() {
        try {
            return notificationService.getAllNotifications();
        } catch (Exception e) {
            System.err.println("[CRITICAL] Failed to fetch all notifications:");
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/mark-read/{id}")
    public void markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PostMapping("/mark-all-read")
    public void markAllRead() {
        notificationService.markAllAsRead();
    }
}
