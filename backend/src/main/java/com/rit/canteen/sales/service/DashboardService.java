package com.rit.canteen.sales.service;

import com.rit.canteen.sales.model.DashboardStats;
import com.rit.canteen.sales.model.GeneralDashboardData;
import com.rit.canteen.sales.model.Order;
import com.rit.canteen.sales.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private OrderRepository orderRepository;

    public GeneralDashboardData getGeneralDashboardData() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        
        DashboardStats stats = getDashboardStats();

        // 1. Store Overview
        List<Object[]> storeData = orderRepository.getStoreOverview(startOfToday, endOfToday);
        List<Map<String, Object>> storeOverview = new ArrayList<>();
        for (Object[] row : storeData) {
            Map<String, Object> store = new HashMap<>();
            store.put("name", row[0] != null ? row[0] : "Unknown Stall");
            store.put("sale", row[1] != null ? row[1] : 0);
            store.put("orders", row[2] != null ? row[2] : 0);
            store.put("taxes", 0); // Placeholder
            store.put("purchase", 0); // Placeholder
            storeOverview.add(store);
        }

        // 2. Hourly Sales
        List<Object[]> hourlyData = orderRepository.getHourlySales(startOfToday, endOfToday);
        List<Map<String, Object>> hourlySales = new ArrayList<>();
        // Initialize 24 hours
        for (int i = 0; i < 24; i += 2) {
            Map<String, Object> hourMap = new HashMap<>();
            String label = i == 0 ? "12am" : (i > 12 ? (i-12) + "pm" : i + (i == 12 ? "pm" : "am"));
            hourMap.put("time", label);
            hourMap.put("value", 0);
            
            for (Object[] row : hourlyData) {
                int h = (int) row[0];
                if (h >= i && h < i + 2) {
                    BigDecimal val = (BigDecimal) row[1];
                    hourMap.put("value", ((Number) hourMap.get("value")).doubleValue() + val.doubleValue());
                }
            }
            hourlySales.add(hourMap);
        }

        // 3. Dynamic Insights
        List<String> insights = new ArrayList<>();
        if (stats.getActiveOrders() > 0) {
            insights.add(stats.getActiveOrders() + " orders today! Clearly the crowd's found their happy place 💃🕺");
            BigDecimal avg = stats.getTotalSales() > 0 ? BigDecimal.valueOf(stats.getTotalSales()).divide(BigDecimal.valueOf(stats.getActiveOrders()), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            insights.add("₹" + avg + " average order value! Proof that happy bellies don't need heavy bills 🤤🔥");
        } else {
            insights.add("Waiting for the first orders of the day to roll in... ☕");
        }

        return new GeneralDashboardData(stats, storeOverview, hourlySales, insights);
    }

    public DashboardStats getDashboardStats() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        
        LocalDateTime startOfYesterday = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime endOfYesterday = LocalDate.now().minusDays(1).atTime(LocalTime.MAX);

        BigDecimal totalRevenueRaw = orderRepository.getTotalRevenue();
        long totalSales = totalRevenueRaw != null ? totalRevenueRaw.longValue() : 0;
        
        int activeOrders = (int) orderRepository.countByCreatedAtGreaterThanEqual(startOfToday);
        int dailyCustomers = (int) orderRepository.countUniqueUsersToday(startOfToday);

        BigDecimal todayRevenue = orderRepository.getRevenuePerPeriod(startOfToday, endOfToday);
        BigDecimal yesterdayRevenue = orderRepository.getRevenuePerPeriod(startOfYesterday, endOfYesterday);
        
        double growth = 0;
        if (yesterdayRevenue != null && yesterdayRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal today = todayRevenue != null ? todayRevenue : BigDecimal.ZERO;
            growth = today.subtract(yesterdayRevenue)
                    .divide(yesterdayRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100))
                    .doubleValue();
        } else if (todayRevenue != null && todayRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growth = 100.0;
        }

        return new DashboardStats(totalSales, activeOrders, dailyCustomers, growth);
    }

    public List<Order> getRecentOrders() {
        return orderRepository.findTop5ByOrderByCreatedAtDesc();
    }
}
