package com.rit.canteen.sales.service;

import com.rit.canteen.sales.model.CouponCode;
import com.rit.canteen.sales.model.SystemNotification;
import com.rit.canteen.sales.repository.CouponRepository;
import com.rit.canteen.sales.repository.SystemNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SystemNotificationService {

    @Autowired
    private SystemNotificationRepository notificationRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Transactional
    public void createNotification(String title, String message, String type, String link) {
        SystemNotification notification = new SystemNotification(title, message, type, link);
        notificationRepository.save(notification);
    }

    public List<SystemNotification> getUnreadNotifications() {
        return notificationRepository.findByReadStatusFalse();
    }

    public List<SystemNotification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setReadStatus(Boolean.TRUE);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead() {
        List<SystemNotification> unread = notificationRepository.findByReadStatusFalse();
        for (SystemNotification n : unread) {
            n.setReadStatus(Boolean.TRUE);
        }
        notificationRepository.saveAll(unread);
    }

    // Triggered every 6 hours to check for expiring coupons
    @Scheduled(fixedRate = 21600000)
    @Transactional
    public void checkExpiringCoupons() {
        LocalDateTime threshold = LocalDateTime.now().plusHours(48);
        List<CouponCode> expiringSoon = couponRepository.findByExpiryDateBeforeAndIsActiveTrue(threshold);
        
        for (CouponCode coupon : expiringSoon) {
            String title = "Coupon Expiring Soon: " + coupon.getCode();
            // Avoid duplicate notifications for the same coupon within the last 24 hours
            boolean exists = notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                    .anyMatch(n -> n.getTitle().equals(title) && n.getCreatedAt().isAfter(LocalDateTime.now().minusDays(1)));
            
            if (!exists) {
                createNotification(
                    title,
                    "Ritz Coupon code '" + coupon.getCode() + "' is set to expire on " + coupon.getExpiryDate() + ". Consider extending or updating it.",
                    "COUPON",
                    "/ritz/coupons"
                );
            }
        }
    }
}
