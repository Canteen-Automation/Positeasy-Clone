package com.rit.canteen.sales.counter.controller;

import com.rit.canteen.sales.counter.model.CounterInfo;
import com.rit.canteen.sales.counter.service.CounterInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/counter/counters")
public class CounterInfoController {

    @Autowired
    private CounterInfoService counterService;

    @GetMapping
    public List<CounterInfo> getAllCounters() {
        return counterService.getAllCounters();
    }

    @GetMapping("/{id}")
    public CounterInfo getCounterById(@PathVariable Long id) {
        return counterService.getCounterById(id)
                .orElseThrow(() -> new RuntimeException("Counter not found"));
    }

    @PostMapping
    public CounterInfo createCounter(@RequestBody CounterInfo counter) {
        return counterService.createCounter(counter);
    }

    @PutMapping("/{id}")
    public CounterInfo updateCounter(@PathVariable Long id, @RequestBody CounterInfo counter) {
        return counterService.updateCounter(id, counter);
    }

    @DeleteMapping("/{id}")
    public void deleteCounter(@PathVariable Long id) {
        counterService.deleteCounter(id);
    }

    @PostMapping("/{counterId}/assign-product/{productId}")
    public void assignProduct(@PathVariable Long counterId, @PathVariable Long productId) {
        counterService.assignProductToCounter(counterId, productId);
    }
}
