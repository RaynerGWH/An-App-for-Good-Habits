package com.example.demo.controller;

import com.example.demo.model.Habit;
import com.example.demo.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "*")  // Allow requests from Electron
public class HabitController {

    @Autowired
    private HabitRepository habitRepository;
    
    @GetMapping
    public List<Habit> getAllHabits() {
        return habitRepository.findAll();
    }
    
    @GetMapping("/{frequency}")
    public List<Habit> getHabitsByFrequency(@PathVariable String frequency) {
        return habitRepository.findByFrequency(frequency);
    }
    
    @PostMapping
    public Habit addHabit(@RequestBody Habit habit) {
        return habitRepository.save(habit);
    }
    
    @PutMapping("/{id}")
    public Habit updateHabit(@PathVariable Long id, @RequestBody Habit habitDetails) {
        Habit habit = habitRepository.findById(id).orElseThrow();
        habit.setDescription(habitDetails.getDescription());
        habit.setFrequency(habitDetails.getFrequency());
        habit.setCompleted(habitDetails.isCompleted());
        if (habitDetails.getLastNotified() != null) {
            habit.setLastNotified(habitDetails.getLastNotified());
        }
        return habitRepository.save(habit);
    }
    
    @DeleteMapping("/{id}")
    public void deleteHabit(@PathVariable Long id) {
        habitRepository.deleteById(id);
    }
}