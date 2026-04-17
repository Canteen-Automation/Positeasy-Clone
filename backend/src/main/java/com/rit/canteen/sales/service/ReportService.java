package com.rit.canteen.sales.service;

import com.rit.canteen.sales.repository.OrderRepository;
import com.rit.canteen.sales.repository.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    public Map<String, Object> getMonthlyReport(LocalDateTime from, LocalDateTime to) {
        Map<String, Object> report = new HashMap<>();
        
        // 1. Sales Summary
        BigDecimal totalSales = orderRepository.getRevenuePerPeriod(from, to);
        report.put("totalSales", totalSales != null ? totalSales : BigDecimal.ZERO);
        report.put("totalOrders", orderRepository.countByCreatedAtBetween(from, to));
        
        // 2. Top Selling Items
        List<Object[]> topItemsData = orderRepository.getTopSellingItems(from, to);
        List<Map<String, Object>> topItems = new ArrayList<>();
        for (int i = 0; i < Math.min(topItemsData.size(), 10); i++) {
            Object[] row = topItemsData.get(i);
            Map<String, Object> item = new HashMap<>();
            item.put("name", row[0]);
            item.put("quantity", row[1]);
            item.put("revenue", row[2]);
            topItems.add(item);
        }
        report.put("topSellingItems", topItems);
        
        // 3. Purchase Summary
        BigDecimal totalPurchases = purchaseOrderRepository.getTotalPurchaseAmountInRange(from, to);
        report.put("totalPurchases", totalPurchases != null ? totalPurchases : BigDecimal.ZERO);
        
        // 4. Vendor Summary
        List<Object[]> vendorData = purchaseOrderRepository.getVendorSummary(from, to);
        List<Map<String, Object>> vendorSummary = new ArrayList<>();
        String topVendor = "N/A";
        BigDecimal maxAmount = BigDecimal.ZERO;
        
        for (Object[] row : vendorData) {
            Map<String, Object> vendor = new HashMap<>();
            String name = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            vendor.put("name", name);
            vendor.put("amount", amount);
            vendor.put("orderCount", row[2]);
            vendorSummary.add(vendor);
            
            if (amount.compareTo(maxAmount) > 0) {
                maxAmount = amount;
                topVendor = name;
            }
        }
        report.put("vendorSummary", vendorSummary);
        report.put("topVendor", topVendor);
        
        // 5. Store/Stall Overview
        List<Object[]> storeData = orderRepository.getStoreOverview(from, to);
        List<Map<String, Object>> storeOverview = new ArrayList<>();
        for (Object[] row : storeData) {
            Map<String, Object> store = new HashMap<>();
            store.put("name", row[0] != null ? row[0] : "Unknown Stall");
            store.put("sale", row[1] != null ? row[1] : 0);
            store.put("orders", row[2] != null ? row[2] : 0);
            storeOverview.add(store);
        }
        report.put("storeOverview", storeOverview);

        return report;
    }
}
