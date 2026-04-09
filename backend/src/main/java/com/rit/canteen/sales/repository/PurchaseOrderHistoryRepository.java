package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.PurchaseOrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseOrderHistoryRepository extends JpaRepository<PurchaseOrderHistory, Long> {
    List<PurchaseOrderHistory> findByPurchaseOrderIdOrderByChangeDateDesc(Long purchaseOrderId);
}
