package com.rit.canteen.sales.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String purchaseId; // PO_1001, etc.

    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(precision = 19, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(precision = 19, scale = 2)
    private BigDecimal paidTotal = BigDecimal.ZERO;

    private String status; // OPEN, RECEIVED, BILLED, CLOSED

    private String referenceId;

    private String instruction;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItem> items;

    public PurchaseOrder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPurchaseId() { return purchaseId; }
    public void setPurchaseId(String purchaseId) { this.purchaseId = purchaseId; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    public BigDecimal getPaidTotal() { return paidTotal; }
    public void setPaidTotal(BigDecimal paidTotal) { this.paidTotal = paidTotal; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getInstruction() { return instruction; }
    public void setInstruction(String instruction) { this.instruction = instruction; }

    public List<PurchaseOrderItem> getItems() { return items; }
    public void setItems(List<PurchaseOrderItem> items) { this.items = items; }
    
    public BigDecimal getPayables() {
        return amount != null ? amount.subtract(paidTotal) : BigDecimal.ZERO;
    }

    public BigDecimal getBalance() {
        return amount != null ? amount.subtract(paidTotal != null ? paidTotal : BigDecimal.ZERO) : BigDecimal.ZERO;
    }
}
