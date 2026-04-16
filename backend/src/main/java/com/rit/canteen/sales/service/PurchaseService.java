package com.rit.canteen.sales.service;

import com.rit.canteen.sales.model.PurchaseOrder;
import com.rit.canteen.sales.model.Vendor;
import com.rit.canteen.sales.repository.PurchaseOrderRepository;
import com.rit.canteen.sales.repository.VendorRepository;
import com.rit.canteen.sales.repository.PurchaseOrderHistoryRepository;
import com.rit.canteen.sales.model.PurchaseOrderHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class PurchaseService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private PurchaseOrderHistoryRepository historyRepository;

    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public PurchaseOrder createOrder(PurchaseOrder order) {
        if (order == null) throw new IllegalArgumentException("Order cannot be null");
        
        // Check for history if this is an update
        if (order.getId() != null) {
            purchaseOrderRepository.findById(order.getId()).ifPresent(existing -> {
                BigDecimal oldAmount = existing.getAmount() != null ? existing.getAmount() : BigDecimal.ZERO;
                BigDecimal newAmount = order.getAmount() != null ? order.getAmount() : BigDecimal.ZERO;
                
                if (oldAmount.compareTo(newAmount) != 0) {
                    historyRepository.save(new PurchaseOrderHistory(existing, oldAmount, newAmount, "Amount updated during processing"));
                }
            });
        }

        // Link items to the parent order
        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setPurchaseOrder(order));
        }

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        // Update vendor statistics (only for NEW orders to avoid double counting, 
        // OR we should adjust the difference for updates - but user mostly wants new orders tracked)
        if (order.getId() == null && savedOrder.getVendor() != null && savedOrder.getVendor().getId() != null) {
            vendorRepository.findById(savedOrder.getVendor().getId()).ifPresent(vendor -> {
                vendor.setTotalOrders((vendor.getTotalOrders() != null ? vendor.getTotalOrders() : 0) + 1);
                BigDecimal currentAmount = vendor.getTotalAmount() != null ? vendor.getTotalAmount() : BigDecimal.ZERO;
                BigDecimal orderAmount = savedOrder.getAmount() != null ? savedOrder.getAmount() : BigDecimal.ZERO;
                vendor.setTotalAmount(currentAmount.add(orderAmount));
                vendorRepository.save(vendor);
            });
        }

        return savedOrder;
    }

    public List<PurchaseOrderHistory> getOrderHistory(Long orderId) {
        return historyRepository.findByPurchaseOrderIdOrderByChangeDateDesc(orderId);
    }

    public Vendor createVendor(Vendor vendor) {
        if (vendor == null) throw new IllegalArgumentException("Vendor cannot be null");
        return vendorRepository.save(vendor);
    }

    public Optional<PurchaseOrder> getOrderById(Long id) {
        if (id == null) return Optional.empty();
        return purchaseOrderRepository.findById(id);
    }

    public void deleteVendor(Long id) {
        if (id != null) vendorRepository.deleteById(id);
    }

    public void deleteOrder(Long id) {
        if (id != null) purchaseOrderRepository.deleteById(id);
    }

    public Map<String, Object> getPurchaseSummary() {
        Map<String, Object> summary = new HashMap<>();
        BigDecimal total = purchaseOrderRepository.getTotalPurchaseAmount();
        BigDecimal balance = purchaseOrderRepository.getTotalBalanceAmount();
        long unpaidCount = purchaseOrderRepository.countUnpaidBills();
        
        summary.put("totalAmount", total != null ? total : BigDecimal.ZERO);
        summary.put("balanceAmount", balance != null ? balance : BigDecimal.ZERO);
        summary.put("paidAmount", (total != null ? total : BigDecimal.ZERO).subtract(balance != null ? balance : BigDecimal.ZERO));
        summary.put("unpaidCount", unpaidCount);
        
        List<Object[]> trendData = purchaseOrderRepository.getPurchaseTrend();
        List<Map<String, Object>> trend = new ArrayList<>();
        for (Object[] row : trendData) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", row[0].toString());
            point.put("amount", row[1]);
            trend.add(point);
        }
        summary.put("trend", trend);
        
        return summary;
    }

    public Map<String, Object> getIntentSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("openCount", purchaseOrderRepository.countByStatus("OPEN"));
        summary.put("openItems", purchaseOrderRepository.countOpenItems());
        summary.put("payableAmount", purchaseOrderRepository.getTotalBalanceAmount());
        summary.put("unbilledCount", purchaseOrderRepository.countByStatus("RECEIVED")); // Assuming RECEIVED but not yet BILLED
        
        List<PurchaseOrder> recent = purchaseOrderRepository.findTop5ByOrderByDateDesc();
        summary.put("recentOrders", recent);
        
        List<Object[]> trendData = purchaseOrderRepository.getPurchaseTrend();
        summary.put("trend", trendData);
        
        return summary;
    }
}
