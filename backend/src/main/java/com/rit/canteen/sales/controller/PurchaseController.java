package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.PurchaseOrder;
import com.rit.canteen.sales.model.PurchaseOrderHistory;
import com.rit.canteen.sales.model.Vendor;
import com.rit.canteen.sales.service.PurchaseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private static final Logger logger = LoggerFactory.getLogger(PurchaseController.class);

    @Autowired
    private PurchaseService purchaseService;

    @GetMapping("/orders")
    public List<PurchaseOrder> getAllOrders() {
        return purchaseService.getAllOrders();
    }

    @PostMapping("/orders")
    public PurchaseOrder createOrder(@RequestBody PurchaseOrder order) {
        logger.info("Received request to create/update order: {}", order.getPurchaseId());
        return purchaseService.createOrder(order);
    }

    @GetMapping("/orders/{id}/history")
    public List<PurchaseOrderHistory> getOrderHistory(@PathVariable Long id) {
        return purchaseService.getOrderHistory(id);
    }

    @GetMapping("/vendors")
    public List<Vendor> getAllVendors() {
        return purchaseService.getAllVendors();
    }

    @PostMapping("/vendors")
    public ResponseEntity<?> createVendor(@RequestBody Vendor vendor) {
        try {
            logger.info("Received request to create/update vendor: {}", vendor.getName());
            Vendor savedVendor = purchaseService.createVendor(vendor);
            return ResponseEntity.ok(savedVendor);
        } catch (Exception e) {
            logger.error("Error creating/updating vendor: ", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/vendors/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        purchaseService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        purchaseService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return purchaseService.getPurchaseSummary();
    }

    @GetMapping("/intent/summary")
    public Map<String, Object> getIntentSummary() {
        return purchaseService.getIntentSummary();
    }
}
