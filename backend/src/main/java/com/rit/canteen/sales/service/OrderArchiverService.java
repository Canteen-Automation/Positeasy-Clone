package com.rit.canteen.sales.service;

import com.rit.canteen.sales.model.Order;
import com.rit.canteen.sales.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderArchiverService {

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Ensures all old orders are archived immediately upon application startup.
     */
    @PostConstruct
    public void init() {
        System.out.println("Application startup: Triggering proactive order archival...");
        archivePreviousDayOrders();
    }

    /**
     * Automatically archives orders from previous days at midnight (12:00 AM).
     * Cron: 0 0 0 * * * (Second Minute Hour Day Month DayOfWeek)
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void archivePreviousDayOrders() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        System.out.println("Starting automated archival process for orders before: " + startOfToday);
        
        List<Order> ordersToArchive = orderRepository.findByIsArchivedFalseAndCreatedAtBefore(startOfToday);
        
        if (!ordersToArchive.isEmpty()) {
            for (Order order : ordersToArchive) {
                order.setArchived(true);
            }
            orderRepository.saveAll(ordersToArchive);
            System.out.println("Successfully archived " + ordersToArchive.size() + " orders.");
        } else {
            System.out.println("No orders found to archive for today.");
        }
    }
    
    /**
     * Manual trigger for archival logic (useful for testing or initial setup).
     */
    @Transactional
    public int archiveNow() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        List<Order> ordersToArchive = orderRepository.findByIsArchivedFalseAndCreatedAtBefore(startOfToday);
        
        for (Order order : ordersToArchive) {
            order.setArchived(true);
        }
        orderRepository.saveAll(ordersToArchive);
        return ordersToArchive.size();
    }
}
