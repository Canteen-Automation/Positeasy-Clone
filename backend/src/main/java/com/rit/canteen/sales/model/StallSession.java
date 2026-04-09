package com.rit.canteen.sales.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "stall_sessions")
public class StallSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String dayOfWeek;

    private boolean active;

    private LocalTime startTime;

    private LocalTime endTime;

    public StallSession() {}

    public StallSession(String dayOfWeek, boolean active, LocalTime startTime, LocalTime endTime) {
        this.dayOfWeek = dayOfWeek;
        this.active = active;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}
