package com.rit.canteen.sales.model;

public class DashboardStats {
    private long totalSales;
    private int activeOrders;
    private int dailyCustomers;
    private double revenueGrowth;

    public DashboardStats(long totalSales, int activeOrders, int dailyCustomers, double revenueGrowth) {
        this.totalSales = totalSales;
        this.activeOrders = activeOrders;
        this.dailyCustomers = dailyCustomers;
        this.revenueGrowth = revenueGrowth;
    }

    // Getters and Setters
    public long getTotalSales() { return totalSales; }
    public void setTotalSales(long totalSales) { this.totalSales = totalSales; }

    public int getActiveOrders() { return activeOrders; }
    public void setActiveOrders(int activeOrders) { this.activeOrders = activeOrders; }

    public int getDailyCustomers() { return dailyCustomers; }
    public void setDailyCustomers(int dailyCustomers) { this.dailyCustomers = dailyCustomers; }

    public double getRevenueGrowth() { return revenueGrowth; }
    public void setRevenueGrowth(double revenueGrowth) { this.revenueGrowth = revenueGrowth; }
}
