package com.rit.canteen.sales.counter.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "counter_info")
public class CounterInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String location;

    @OneToMany(mappedBy = "counter")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<CounterProduct> products;

    public CounterInfo() {
    }

    public CounterInfo(String name, String location) {
        this.name = name;
        this.location = location;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<CounterProduct> getProducts() {
        return products;
    }

    public void setProducts(List<CounterProduct> products) {
        this.products = products;
    }
}
