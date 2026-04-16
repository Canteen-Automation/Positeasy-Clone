package com.rit.canteen.sales.model;

public class DashboardStats {
    private long totalSales;
    private int activeOrders;
    private int dailyCustomers;
    private double growth;

    public DashboardStats() {}

    public DashboardStats(long totalSales, int activeOrders, int dailyCustomers, double growth) {
        this.totalSales = totalSales;
        this.activeOrders = activeOrders;
        this.dailyCustomers = dailyCustomers;
        this.growth = growth;
    }

    public long getTotalSales() { return totalSales; }
    public void setTotalSales(long totalSales) { this.totalSales = totalSales; }

    public int getActiveOrders() { return activeOrders; }
    public void setActiveOrders(int activeOrders) { this.activeOrders = activeOrders; }

    public int getDailyCustomers() { return dailyCustomers; }
    public void setDailyCustomers(int dailyCustomers) { this.dailyCustomers = dailyCustomers; }

    public double getGrowth() { return growth; }
    public void setGrowth(double growth) { this.growth = growth; }
}
