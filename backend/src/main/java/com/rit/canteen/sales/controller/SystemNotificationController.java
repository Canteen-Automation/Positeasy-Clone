package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.SystemNotification;
import com.rit.canteen.sales.service.SystemNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class SystemNotificationController {

    @Autowired
    private SystemNotificationService notificationService;

    @GetMapping
    public List<SystemNotification> getUnread() {
        return notificationService.getUnreadNotifications();
    }

    @GetMapping("/all")
    public List<SystemNotification> getAll() {
        return notificationService.getAllNotifications();
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
