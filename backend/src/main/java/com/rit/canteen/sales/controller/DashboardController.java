package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.GeneralDashboardData;
import com.rit.canteen.sales.model.ProcurementDashboardData;
import com.rit.canteen.sales.model.Order;
import com.rit.canteen.sales.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public GeneralDashboardData getStats(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime from,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime to) {
        return dashboardService.getGeneralDashboardData(from, to);
    }

    @GetMapping("/procurement")
    public ProcurementDashboardData getProcurementStats() {
        return dashboardService.getProcurementDashboardData();
    }

    @GetMapping("/recent-orders")
    public List<Order> getRecentOrders() {
        return dashboardService.getRecentOrders();
    }
}
