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
import com.rit.canteen.sales.repository.UserRepository;
import com.rit.canteen.sales.service.OrderArchiverService;
import com.rit.canteen.sales.service.TokenService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
    private UserRepository userRepository;

    @Autowired
    private OrderArchiverService orderArchiverService;

    @Autowired
    private TokenService tokenService;

    // Use ThreadLocal to safely store conflicts for the current request context
    private static final ThreadLocal<List<Map<String, Object>>> requestConflicts = new ThreadLocal<>();

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
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> placeOrder(@RequestBody Order order) {
        // 1. Pre-validation and linking
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Order must have items"));
        }

        // 2. Atomic Stock Check & Update
        List<Map<String, Object>> stockConflicts = new ArrayList<>();
        requestConflicts.remove(); // Clear before use
        
        for (OrderItem item : order.getItems()) {
            Long productId = item.getProductId();
            if (productId != null) {
                int updatedRows = productRepository.decrementStock(productId, item.getQuantity());
                
                if (updatedRows == 0) {
                    com.rit.canteen.sales.model.Product p = productRepository.findById(productId).orElse(null);
                    int left = (p != null && p.getStock() != null) ? p.getStock() : 0;
                    
                    Map<String, Object> conflict = new HashMap<>();
                    conflict.put("productId", productId);
                    conflict.put("productName", item.getProductName());
                    conflict.put("requested", item.getQuantity());
                    conflict.put("available", left);
                    stockConflicts.add(conflict);
                }
            }
        }

        if (!stockConflicts.isEmpty()) {
            requestConflicts.set(stockConflicts);
            throw new RuntimeException("CONCURRENCY_STOCK_FAILURE");
        }

        // 3. Complete Order Details
        for (OrderItem item : order.getItems()) {
            item.setOrder(order);
        }
        
        LocalDateTime now = LocalDateTime.now();
        order.setCreatedAt(now);
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        long todaysOrderCount = orderRepository.countByCreatedAtGreaterThanEqual(startOfDay);
        String displayId = String.format("%03d", todaysOrderCount + 1);
        order.setDisplayOrderId(displayId);
        
        // 4. Token Payment Check
        if ("RITZ_TOKEN".equals(order.getPaymentMethod())) {
            try {
                // Use userId directly for robustness
                tokenService.spend(order.getUserId(), order.getTotalAmount(), "ORD-" + displayId);
            } catch (RuntimeException e) {
                if ("INSUFFICIENT_TOKENS".equals(e.getMessage())) {
                    throw new RuntimeException("INSUFFICIENT_TOKENS");
                }
                throw e;
            }
        }
        
        // 5. Final Save
        Order savedOrder = orderRepository.save(order);
        
        System.out.println("Placed Order: " + savedOrder.getId() + " -> Display ID: #" + displayId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "orderNumber", savedOrder.getOrderNumber(),
            "displayOrderId", savedOrder.getDisplayOrderId(),
            "message", "Order placed successfully"
        ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        if ("CONCURRENCY_STOCK_FAILURE".equals(e.getMessage())) {
            List<Map<String, Object>> conflicts = requestConflicts.get();
            requestConflicts.remove();
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "errorType", "STOCK_ERROR",
                "message", "Some items in your cart are no longer available in the requested quantity.",
                "conflicts", conflicts != null ? conflicts : new ArrayList<>()
            ));
        }
        if ("INSUFFICIENT_TOKENS".equals(e.getMessage())) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "errorType", "TOKEN_ERROR",
                "message", "Insufficient Ritz Tokens. Please top up your wallet."
            ));
        }
        return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage() != null ? e.getMessage() : "Internal Server Error"));
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
                        String oldStatus = order.getStatus();
                        String nextStatus = newStatus.toUpperCase();
                        
                        // Check for refund condition: Moving to CANCELLED from a non-cancelled state
                        if ("CANCELLED".equals(nextStatus) && !"CANCELLED".equals(oldStatus)) {
                            if ("RITZ_TOKEN".equals(order.getPaymentMethod())) {
                                tokenService.refund(order.getUserId(), "ORD-" + order.getDisplayOrderId(), order.getTotalAmount(), "Status changed to CANCELLED");
                            }
                        }
                        
                        order.setStatus(nextStatus);
                        orderRepository.save(order);
                        return ResponseEntity.ok(Map.of("success", true, "message", "Order status updated to " + nextStatus));
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
                        BigDecimal oldAmount = existingOrder.getTotalAmount();
                        BigDecimal newAmount = updatedOrder.getTotalAmount();
                        
                        // Handle Token Adjustments for edited orders
                        if ("RITZ_TOKEN".equals(existingOrder.getPaymentMethod())) {
                            int comparison = newAmount.compareTo(oldAmount);
                            if (comparison > 0) {
                                // Spend more
                                tokenService.spend(existingOrder.getUserId(), newAmount.subtract(oldAmount), "ORD-EDIT-" + existingOrder.getDisplayOrderId());
                            } else if (comparison < 0) {
                                // This is tricky for individual tokens, but we can refund the difference amount
                                // For simplicity/robustness, we'll refund the whole order and re-spend the new amount 
                                // to keep unit association clean OR just record it as a topup.
                                // Let's do a simple balance restoration for the delta.
                                tokenService.refund(existingOrder.getUserId(), "ORD-" + existingOrder.getDisplayOrderId(), oldAmount, "Order price reduced during edit");
                                tokenService.spend(existingOrder.getUserId(), newAmount, "ORD-" + existingOrder.getDisplayOrderId());
                            }
                        }

                        // Update basic fields
                        existingOrder.setTotalAmount(newAmount);
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
