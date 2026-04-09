package com.rit.canteen.sales.model;

public class TerminalDTO {
    private Long id;
    private String name;
    private String location;
    private String apiKey;
    private String pin;

    public TerminalDTO() {}

    public TerminalDTO(Long id, String name, String location, String apiKey, String pin) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.apiKey = apiKey;
        this.pin = pin;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }
}
