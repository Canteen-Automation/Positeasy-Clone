package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.GeneralDashboardData;
import com.rit.canteen.sales.model.Order;
import com.rit.canteen.sales.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public GeneralDashboardData getStats() {
        return dashboardService.getGeneralDashboardData();
    }

    @GetMapping("/recent-orders")
    public List<Order> getRecentOrders() {
        return dashboardService.getRecentOrders();
    }
}
