package com.rit.canteen.sales.model;

public class DashboardStats {
    private long totalSales;
    private long periodRevenue;
    private int activeOrders;
    private int dailyCustomers;
    private double growth;
    private long totalExpenses;
    private long periodExpenses;

    public DashboardStats() {}

    public DashboardStats(long totalSales, long periodRevenue, int activeOrders, int dailyCustomers, double growth, long totalExpenses, long periodExpenses) {
        this.totalSales = totalSales;
        this.periodRevenue = periodRevenue;
        this.activeOrders = activeOrders;
        this.dailyCustomers = dailyCustomers;
        this.growth = growth;
        this.totalExpenses = totalExpenses;
        this.periodExpenses = periodExpenses;
    }

    public long getTotalSales() { return totalSales; }
    public void setTotalSales(long totalSales) { this.totalSales = totalSales; }

    public long getPeriodRevenue() { return periodRevenue; }
    public void setPeriodRevenue(long periodRevenue) { this.periodRevenue = periodRevenue; }

    public int getActiveOrders() { return activeOrders; }
    public void setActiveOrders(int activeOrders) { this.activeOrders = activeOrders; }

    public int getDailyCustomers() { return dailyCustomers; }
    public void setDailyCustomers(int dailyCustomers) { this.dailyCustomers = dailyCustomers; }

    public double getGrowth() { return growth; }
    public void setGrowth(double growth) { this.growth = growth; }

    public long getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(long totalExpenses) { this.totalExpenses = totalExpenses; }

    public long getPeriodExpenses() { return periodExpenses; }
    public void setPeriodExpenses(long periodExpenses) { this.periodExpenses = periodExpenses; }
}
