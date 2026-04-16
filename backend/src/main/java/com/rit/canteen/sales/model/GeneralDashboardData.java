package com.rit.canteen.sales.model;

import java.util.List;
import java.util.Map;

public class GeneralDashboardData {
    private DashboardStats stats;
    private List<Map<String, Object>> storeOverview;
    private List<Map<String, Object>> hourlySales;
    private List<String> insights;

    public GeneralDashboardData() {}

    public GeneralDashboardData(DashboardStats stats, List<Map<String, Object>> storeOverview, List<Map<String, Object>> hourlySales, List<String> insights) {
        this.stats = stats;
        this.storeOverview = storeOverview;
        this.hourlySales = hourlySales;
        this.insights = insights;
    }

    public DashboardStats getStats() { return stats; }
    public void setStats(DashboardStats stats) { this.stats = stats; }

    public List<Map<String, Object>> getStoreOverview() { return storeOverview; }
    public void setStoreOverview(List<Map<String, Object>> storeOverview) { this.storeOverview = storeOverview; }

    public List<Map<String, Object>> getHourlySales() { return hourlySales; }
    public void setHourlySales(List<Map<String, Object>> hourlySales) { this.hourlySales = hourlySales; }

    public List<String> getInsights() { return insights; }
    public void setInsights(List<String> insights) { this.insights = insights; }
}
