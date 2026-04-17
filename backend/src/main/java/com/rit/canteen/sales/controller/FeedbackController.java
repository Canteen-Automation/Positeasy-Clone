package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.Feedback;
import com.rit.canteen.sales.model.ItemRating;
import com.rit.canteen.sales.model.Order;
import com.rit.canteen.sales.repository.FeedbackRepository;
import com.rit.canteen.sales.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public Page<Feedback> getAllFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return feedbackRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @GetMapping("/item-details")
    public Page<Map<String, Object>> getItemDetails(
            @RequestParam String productName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ItemRating> ratings = feedbackRepository.findByProductName(productName, PageRequest.of(page, size));
        return ratings.map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("rating", r.getRating());
            
            // Priority: Item-specific comment -> parent Feedback comment -> empty
            String comment = r.getComment();
            if (comment == null || comment.isBlank()) {
                if (r.getFeedback() != null) {
                    comment = r.getFeedback().getComment();
                }
            }
            
            map.put("comment", comment != null ? comment : "");
            map.put("date", r.getFeedback() != null ? r.getFeedback().getCreatedAt() : java.time.LocalDateTime.now());
            return map;
        });
    }

    @GetMapping("/stats")
    public Map<String, Object> getFeedbackStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Double avg = feedbackRepository.getAverageRating();
        stats.put("averageRating", avg != null ? avg : 0.0);
        
        List<Object[]> distribution = feedbackRepository.getRatingDistribution();
        List<Map<String, Object>> distList = new ArrayList<>();
        for (Object[] row : distribution) {
            Map<String, Object> item = new HashMap<>();
            item.put("rating", row[0]);
            item.put("count", row[1]);
            distList.add(item);
        }
        stats.put("distribution", distList);
        
        List<Object[]> topRated = feedbackRepository.getTopRatedItems();
        List<Map<String, Object>> topList = new ArrayList<>();
        for (Object[] row : topRated) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", row[0]);
            item.put("average", row[1]);
            item.put("count", row[2]);
            topList.add(item);
        }
        stats.put("ratedItems", topList);
        
        return stats;
    }

    @GetMapping("/latest-unrated/{userId}")
    public ResponseEntity<Order> getLatestUnratedOrder(@PathVariable Long userId) {
        // Look for any order that is either PAID or COMPLETED
        Optional<Order> latestOrderOpt = orderRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
        
        if (latestOrderOpt.isPresent()) {
            Order order = latestOrderOpt.get();
            String status = order.getStatus().toUpperCase();
            if ((status.equals("PAID") || status.equals("COMPLETED")) && !order.isHasFeedback()) {
                return ResponseEntity.ok(order);
            }
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/skip/{orderId}")
    @Transactional
    public ResponseEntity<Void> skipFeedback(@PathVariable Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setHasFeedback(true);
            orderRepository.save(order);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/submit")
    @Transactional
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Feedback feedback) {
        if (feedback.getOrder() == null || feedback.getOrder().getId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Order> orderOpt = orderRepository.findById(feedback.getOrder().getId());
        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Order order = orderOpt.get();
        feedback.setOrder(order);
        
        // Link item ratings to feedback and propagate comment
        if (feedback.getItemRatings() != null) {
            for (ItemRating rating : feedback.getItemRatings()) {
                rating.setFeedback(feedback);
                // Propagate the general comment to each item for better visibility in item-wise dashboard
                if (rating.getComment() == null || rating.getComment().isBlank()) {
                    rating.setComment(feedback.getComment());
                }
            }
        }

        Feedback savedFeedback = feedbackRepository.save(feedback);
        
        // Mark order as rated
        order.setHasFeedback(true);
        orderRepository.save(order);

        return ResponseEntity.ok(savedFeedback);
    }
}
