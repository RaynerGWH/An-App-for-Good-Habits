package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Habit {
    
    @Id
    @GeneratedValue
    private Long id;
    
    private String description;
    
    private String frequency; // "THROUGHOUT_DAY", "ONCE_A_DAY", "ONCE_A_WEEK"
    
    private LocalDateTime lastNotified;
    
    private boolean completed;
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getFrequency() {
        return frequency;
    }
    
    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }
    
    public LocalDateTime getLastNotified() {
        return lastNotified;
    }
    
    public void setLastNotified(LocalDateTime lastNotified) {
        this.lastNotified = lastNotified;
    }
    
    public boolean isCompleted() {
        return completed;
    }
    
    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}