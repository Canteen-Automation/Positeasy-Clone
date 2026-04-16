package com.rit.canteen.sales.counter.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "counter_categories")
public class CounterCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<CounterProduct> products;

    public CounterCategory() {
    }

    public CounterCategory(String name) {
        this.name = name;
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

    public List<CounterProduct> getProducts() {
        return products;
    }

    public void setProducts(List<CounterProduct> products) {
        this.products = products;
    }
}
