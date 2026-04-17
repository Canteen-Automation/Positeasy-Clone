package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByPurchaseId(String purchaseId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM PurchaseOrder p")
    java.math.BigDecimal getTotalPurchaseAmount();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(COALESCE(p.amount, 0) - COALESCE(p.paidTotal, 0)) FROM PurchaseOrder p")
    java.math.BigDecimal getTotalBalanceAmount();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM PurchaseOrder p WHERE p.status != 'PAID'")
    long countUnpaidBills();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM PurchaseOrder p WHERE p.date >= :start AND p.date <= :end")
    java.math.BigDecimal getTotalPurchaseAmountInRange(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT p.vendor.name, SUM(p.amount), COUNT(p) FROM PurchaseOrder p WHERE p.date >= :start AND p.date <= :end GROUP BY p.vendor.name")
    List<Object[]> getVendorSummary(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT p.date, SUM(p.amount) FROM PurchaseOrder p WHERE p.date >= :start AND p.date <= :end GROUP BY p.date ORDER BY p.date ASC")
    List<Object[]> getPurchaseTrendInRange(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT p.date, SUM(p.amount) FROM PurchaseOrder p GROUP BY p.date ORDER BY p.date ASC")
    List<Object[]> getPurchaseTrend();

    long countByStatus(String status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(i.quantity) FROM PurchaseOrder p JOIN p.items i WHERE p.status = 'OPEN'")
    Long countOpenItems();

    List<PurchaseOrder> findTop5ByOrderByDateDesc();
}
