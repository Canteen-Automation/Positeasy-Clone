package com.rit.canteen.sales.counter.model;

import jakarta.persistence.*;

@Entity
@Table(name = "counter_products")
public class CounterProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer stock;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private CounterCategory category;

    @ManyToOne
    @JoinColumn(name = "counter_id")
    private CounterInfo counter;

    public CounterProduct() {
    }

    public CounterProduct(String name, Double price, Integer stock, CounterCategory category) {
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.category = category;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public CounterCategory getCategory() {
        return category;
    }

    public void setCategory(CounterCategory category) {
        this.category = category;
    }

    public CounterInfo getCounter() {
        return counter;
    }

    public void setCounter(CounterInfo counter) {
        this.counter = counter;
    }
}
