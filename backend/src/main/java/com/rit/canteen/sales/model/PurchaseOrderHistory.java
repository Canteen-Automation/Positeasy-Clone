package com.rit.canteen.sales.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_order_history")
public class PurchaseOrderHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    private BigDecimal oldAmount;
    private BigDecimal newAmount;
    private LocalDateTime changeDate;
    private String reason;

    public PurchaseOrderHistory() {}

    public PurchaseOrderHistory(PurchaseOrder purchaseOrder, BigDecimal oldAmount, BigDecimal newAmount, String reason) {
        this.purchaseOrder = purchaseOrder;
        this.oldAmount = oldAmount;
        this.newAmount = newAmount;
        this.changeDate = LocalDateTime.now();
        this.reason = reason;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }

    public BigDecimal getOldAmount() { return oldAmount; }
    public void setOldAmount(BigDecimal oldAmount) { this.oldAmount = oldAmount; }

    public BigDecimal getNewAmount() { return newAmount; }
    public void setNewAmount(BigDecimal newAmount) { this.newAmount = newAmount; }

    public LocalDateTime getChangeDate() { return changeDate; }
    public void setChangeDate(LocalDateTime changeDate) { this.changeDate = changeDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
