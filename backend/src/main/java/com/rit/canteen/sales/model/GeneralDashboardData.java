package com.rit.canteen.sales.model;

import java.util.List;
import java.util.Map;

public class GeneralDashboardData {
    private DashboardStats stats;
    private List<Map<String, Object>> storeOverview;
    private List<Map<String, Object>> hourlySales;
    private List<Map<String, String>> insights;
    private List<TrendingItem> trendingItems;

    public GeneralDashboardData() {}

    public GeneralDashboardData(DashboardStats stats, List<Map<String, Object>> storeOverview, List<Map<String, Object>> hourlySales, List<Map<String, String>> insights, List<TrendingItem> trendingItems) {
        this.stats = stats;
        this.storeOverview = storeOverview;
        this.hourlySales = hourlySales;
        this.insights = insights;
        this.trendingItems = trendingItems;
    }

    public DashboardStats getStats() { return stats; }
    public void setStats(DashboardStats stats) { this.stats = stats; }

    public List<Map<String, Object>> getStoreOverview() { return storeOverview; }
    public void setStoreOverview(List<Map<String, Object>> storeOverview) { this.storeOverview = storeOverview; }

    public List<Map<String, Object>> getHourlySales() { return hourlySales; }
    public void setHourlySales(List<Map<String, Object>> hourlySales) { this.hourlySales = hourlySales; }

    public List<Map<String, String>> getInsights() { return insights; }
    public void setInsights(List<Map<String, String>> insights) { this.insights = insights; }

    public List<TrendingItem> getTrendingItems() { return trendingItems; }
    public void setTrendingItems(List<TrendingItem> trendingItems) { this.trendingItems = trendingItems; }
}
