package com.rit.canteen.sales.model;

import java.util.List;
import java.util.Map;

public class ProcurementDashboardData {
    private Map<String, Object> stats;
    private List<Map<String, Object>> trends;
    private List<Map<String, Object>> topVendors;

    public ProcurementDashboardData() {}

    public ProcurementDashboardData(Map<String, Object> stats, List<Map<String, Object>> trends, List<Map<String, Object>> topVendors) {
        this.stats = stats;
        this.trends = trends;
        this.topVendors = topVendors;
    }

    public Map<String, Object> getStats() { return stats; }
    public void setStats(Map<String, Object> stats) { this.stats = stats; }

    public List<Map<String, Object>> getTrends() { return trends; }
    public void setTrends(List<Map<String, Object>> trends) { this.trends = trends; }

    public List<Map<String, Object>> getTopVendors() { return topVendors; }
    public void setTopVendors(List<Map<String, Object>> topVendors) { this.topVendors = topVendors; }
}
