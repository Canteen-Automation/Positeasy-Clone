package com.rit.canteen.sales.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "stalls")
public class Stall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Stall title is required")
    private String name;

    private String description;

    @Column(columnDefinition = "TEXT")
    private String imageData; // Base64 image data

    private boolean active = true;

    private boolean temporarilyClosed = false;

    private boolean sessionOptional = false;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "stall_id")
    private List<StallSession> sessions = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "stall_products",
        joinColumns = @JoinColumn(name = "stall_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    @JsonIgnoreProperties({"stalls", "sessions"})
    private List<Product> products = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "stall_base_items",
        joinColumns = @JoinColumn(name = "stall_id"),
        inverseJoinColumns = @JoinColumn(name = "base_item_id")
    )
    @JsonIgnoreProperties({"imageData", "description"})
    private List<BaseItem> baseItems = new ArrayList<>();

    public Stall() {}

    public Stall(String name, String description, String imageData) {
        this.name = name;
        this.description = description;
        this.imageData = imageData;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }

    public List<BaseItem> getBaseItems() { return baseItems; }
    public void setBaseItems(List<BaseItem> baseItems) { this.baseItems = baseItems; }

    public boolean isTemporarilyClosed() { return temporarilyClosed; }
    public void setTemporarilyClosed(boolean temporarilyClosed) { this.temporarilyClosed = temporarilyClosed; }

    public boolean isSessionOptional() { return sessionOptional; }
    public void setSessionOptional(boolean sessionOptional) { this.sessionOptional = sessionOptional; }

    public List<StallSession> getSessions() { return sessions; }
    public void setSessions(List<StallSession> sessions) { this.sessions = sessions; }
}
