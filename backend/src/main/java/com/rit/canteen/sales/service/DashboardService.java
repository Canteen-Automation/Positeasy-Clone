package com.rit.canteen.sales.service;

import com.rit.canteen.sales.model.DashboardStats;
import com.rit.canteen.sales.model.GeneralDashboardData;
import com.rit.canteen.sales.model.Order;
import com.rit.canteen.sales.model.TrendingItem;
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

    public GeneralDashboardData getGeneralDashboardData(LocalDateTime from, LocalDateTime to) {
        if (from == null) from = LocalDate.now().atStartOfDay();
        if (to == null) to = LocalDate.now().atTime(LocalTime.MAX);
        
        DashboardStats stats = getDashboardStats(from, to);

        System.out.println("Fetching dashboard data for range: " + from + " to " + to);
        // 1. Store Overview
        List<Object[]> storeData = orderRepository.getStoreOverview(from, to);
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
        List<Object[]> hourlyData = orderRepository.getHourlySales(from, to);
        List<Map<String, Object>> hourlySales = new ArrayList<>();
        // Initialize 24 hours
        for (int i = 0; i < 24; i += 2) {
            Map<String, Object> hourMap = new HashMap<>();
            String label = i == 0 ? "12am" : (i > 12 ? (i-12) + "pm" : i + (i == 12 ? "pm" : "am"));
            hourMap.put("time", label);
            hourMap.put("value", 0);
            
            for (Object[] row : hourlyData) {
                int h = ((Number) row[0]).intValue();
                if (h >= i && h < i + 2) {
                    BigDecimal val = (BigDecimal) row[1];
                    hourMap.put("value", ((Number) hourMap.get("value")).doubleValue() + val.doubleValue());
                }
            }
            hourlySales.add(hourMap);
        }

        // 3. Trending Items
        List<Object[]> trendingData = orderRepository.getTopSellingItems(from, to);
        List<TrendingItem> trendingItems = new ArrayList<>();
        for (int i = 0; i < Math.min(trendingData.size(), 4); i++) {
            Object[] row = trendingData.get(i);
            String name = (String) row[0];
            String category = (String) row[1];
            long qty = ((Number) row[2]).longValue();
            String imageData = (String) row[3];
            
            // Format image data for frontend
            String imageUrl = imageData != null ? (imageData.startsWith("http") ? imageData : (imageData.startsWith("data:") ? imageData : "data:image/png;base64," + imageData)) : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80";
            
            trendingItems.add(new TrendingItem(name, category, qty, imageUrl));
        }

        // 4. Dynamic Insights
        List<Map<String, String>> insights = new ArrayList<>();
        if (stats.getActiveOrders() > 0) {
            Map<String, String> orderInsight = new HashMap<>();
            orderInsight.put("text", stats.getActiveOrders() + " orders at RIT Canteen! Clearly the crowd's found their happy place 💃🕺");
            orderInsight.put("color", "bg-rose-50 text-rose-600 border-rose-100");
            insights.add(orderInsight);

            BigDecimal avg = stats.getTotalSales() > 0 ? BigDecimal.valueOf(stats.getTotalSales()).divide(BigDecimal.valueOf(stats.getActiveOrders()), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            Map<String, String> avgInsight = new HashMap<>();
            avgInsight.put("text", "₹" + avg + " average order value! Either everyone's hungry or just living large 🔥😋");
            avgInsight.put("color", "bg-emerald-50 text-emerald-600 border-emerald-100");
            insights.add(avgInsight);

            Map<String, String> customerInsight = new HashMap<>();
            customerInsight.put("text", "RIT Canteen had " + stats.getActiveOrders() + " orders but only " + stats.getDailyCustomers() + " customers — Maybe customers are shy! 🥰");
            customerInsight.put("color", "bg-orange-50 text-orange-600 border-orange-100");
            insights.add(customerInsight);

            Map<String, String> revenueInsight = new HashMap<>();
            revenueInsight.put("text", "RIT Canteen clocked ₹" + String.format("%,d", stats.getTotalSales()) + " — ka-ching! That's called business booming 💸📈");
            revenueInsight.put("color", "bg-blue-50 text-blue-600 border-blue-100");
            insights.add(revenueInsight);
        } else {
            Map<String, String> emptyInsight = new HashMap<>();
            emptyInsight.put("text", "Waiting for the first orders of the day to roll in... ☕");
            emptyInsight.put("color", "bg-indigo-50 text-indigo-600 border-indigo-100");
            insights.add(emptyInsight);
        }

        System.out.println("Dashboard data generated successfully with " + trendingItems.size() + " trending items.");
        return new GeneralDashboardData(stats, storeOverview, hourlySales, insights, trendingItems);
    }

    public DashboardStats getDashboardStats(LocalDateTime from, LocalDateTime to) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        
        LocalDateTime startOfYesterday = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime endOfYesterday = LocalDate.now().minusDays(1).atTime(LocalTime.MAX);

        BigDecimal totalRevenueRaw = orderRepository.getTotalRevenue();
        long totalSales = totalRevenueRaw != null ? totalRevenueRaw.longValue() : 0;
        
        BigDecimal periodRevenueRaw = orderRepository.getRevenuePerPeriod(from, to);
        long periodRevenue = periodRevenueRaw != null ? periodRevenueRaw.longValue() : 0;
        
        int activeOrders = (int) orderRepository.countByCreatedAtBetween(from, to);
        int dailyCustomers = (int) orderRepository.countUniqueUsersInRange(from, to);

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

        return new DashboardStats(totalSales, periodRevenue, activeOrders, dailyCustomers, growth);
    }

    public List<Order> getRecentOrders() {
        return orderRepository.findTop5ByOrderByCreatedAtDesc();
    }
}
