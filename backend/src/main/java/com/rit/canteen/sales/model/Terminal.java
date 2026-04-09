package com.rit.canteen.sales.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "terminals")
public class Terminal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Terminal name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Security PIN is required")
    private String pin;

    @Column(unique = true)
    private String apiKey;

    public Terminal() {}

    public Terminal(String name, String location, String pin, String apiKey) {
        this.name = name;
        this.location = location;
        this.pin = pin;
        this.apiKey = apiKey;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
}
