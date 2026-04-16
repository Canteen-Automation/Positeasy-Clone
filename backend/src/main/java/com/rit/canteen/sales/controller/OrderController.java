package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.Order;
import com.rit.canteen.sales.model.OrderItem;
import com.rit.canteen.sales.model.User;
import com.rit.canteen.sales.repository.OrderRepository;
import com.rit.canteen.sales.repository.ProductRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private com.rit.canteen.sales.service.OrderArchiverService orderArchiverService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentType,
            @RequestParam(required = false) String orderType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean archived,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            System.out.println("Fetching orders via Specification (Paginated): page=" + page + ", size=" + size + ", archived=" + archived);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Specification<Order> spec = (root, query, cb) -> {
                List<Predicate> predicates = new ArrayList<>();
                
                // Add archive filter
                predicates.add(cb.equal(root.get("isArchived"), archived));
                
                if (startDate != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate));
                }
                if (endDate != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate));
                }
                if (status != null && !status.isEmpty()) {
                    predicates.add(cb.equal(root.get("status"), status));
                }
                if (paymentType != null && !paymentType.isEmpty()) {
                    predicates.add(cb.equal(root.get("paymentMethod"), paymentType));
                }
                if (orderType != null && !orderType.isEmpty()) {
                    predicates.add(cb.equal(root.get("orderType"), orderType));
                }
                if (search != null && !search.isEmpty()) {
                    String searchLower = "%" + search.toLowerCase() + "%";
                    Join<Order, User> userJoin = root.join("user", JoinType.LEFT);
                    
                    Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("displayOrderId")), searchLower),
                        cb.like(cb.lower(root.get("orderNumber")), searchLower),
                        cb.like(cb.lower(userJoin.get("name")), searchLower),
                        cb.like(cb.lower(userJoin.get("mobileNumber")), searchLower)
                    );
                    predicates.add(searchPredicate);
                }
                
                // Fetch join for actual data queries to avoid N+1
                if (query != null && !Long.class.equals(query.getResultType()) && !long.class.equals(query.getResultType())) {
                    root.fetch("user", JoinType.LEFT);
                }
                
                return cb.and(predicates.toArray(new Predicate[0]));
            };

            Page<Order> orderPage = orderRepository.findAll(spec, pageable);
            return ResponseEntity.ok(orderPage);
        } catch (Exception e) {
            System.err.println("Error fetching orders with Specification: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/archive-now")
    public ResponseEntity<?> triggerArchival() {
        try {
            int count = orderArchiverService.archiveNow();
            return ResponseEntity.ok(Map.of("success", true, "archivedCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody Order order) {
        try {
            // Link items to the order for bidirectional relationship
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    System.out.println("🛒 RECEIVED ITEM: " + item.getProductName());
                    item.setOrder(order);
                }
            }
            
            // Use the actual creation time or current time for counting
            LocalDateTime now = LocalDateTime.now();
            order.setCreatedAt(now);
            
            // Calculate start of current day to find how many orders placed today
            LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
            long todaysOrderCount = orderRepository.countByCreatedAtGreaterThanEqual(startOfDay);
            
            // Generate formatted display ID (#001, #002...) resetting daily
            String displayId = String.format("%03d", todaysOrderCount + 1);
            order.setDisplayOrderId(displayId);
            
            // Save the complete order first
            Order savedOrder = orderRepository.save(order);
            
            // --- Reduct Stock Logic ---
            if (savedOrder.getItems() != null) {
                for (OrderItem item : savedOrder.getItems()) {
                    Long productId = item.getProductId();
                    if (productId != null) {
                        productRepository.findById(productId).ifPresent(product -> {
                            int currentStock = product.getStock() != null ? product.getStock() : 0;
                            product.setStock(currentStock - item.getQuantity());
                            productRepository.save(product);
                            System.out.println("Updating Stock for " + product.getName() + ": " + currentStock + " -> " + product.getStock());
                        });
                    }
                }
            }
            
            System.out.println("Placed Daily Order: " + savedOrder.getId() + " -> Display ID: #" + displayId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderNumber", savedOrder.getOrderNumber());
            response.put("displayOrderId", savedOrder.getDisplayOrderId());
            response.put("message", "Order placed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/user/{userId}")
    public List<Order> getUserOrders(@PathVariable Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String newStatus = statusUpdate.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            return orderRepository.findById(id)
                    .map(order -> {
                        order.setStatus(newStatus.toUpperCase());
                        orderRepository.save(order);
                        return ResponseEntity.ok(Map.of("success", true, "message", "Order status updated to " + newStatus));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody Order updatedOrder) {
        try {
            return orderRepository.findById(id)
                    .map(existingOrder -> {
                        // Update basic fields
                        existingOrder.setTotalAmount(updatedOrder.getTotalAmount());
                        existingOrder.setPaymentMethod(updatedOrder.getPaymentMethod());
                        
                        // Clear and replace items for a clean update
                        existingOrder.getItems().clear();
                        if (updatedOrder.getItems() != null) {
                            for (OrderItem newItem : updatedOrder.getItems()) {
                                newItem.setOrder(existingOrder);
                                existingOrder.getItems().add(newItem);
                            }
                        }
                        
                        Order saved = orderRepository.save(existingOrder);
                        return ResponseEntity.ok(saved);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
