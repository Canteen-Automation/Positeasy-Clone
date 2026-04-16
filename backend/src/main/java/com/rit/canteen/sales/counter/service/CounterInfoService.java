package com.rit.canteen.sales.counter.service;

import com.rit.canteen.sales.counter.model.CounterInfo;
import com.rit.canteen.sales.counter.model.CounterProduct;
import com.rit.canteen.sales.counter.repository.CounterInfoRepository;
import com.rit.canteen.sales.counter.repository.CounterProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CounterInfoService {

    @Autowired
    private CounterInfoRepository counterRepository;

    @Autowired
    private CounterProductRepository productRepository;

    public List<CounterInfo> getAllCounters() {
        return counterRepository.findAll();
    }

    public Optional<CounterInfo> getCounterById(Long id) {
        return counterRepository.findById(id);
    }

    public CounterInfo createCounter(CounterInfo counter) {
        return counterRepository.save(counter);
    }

    public CounterInfo updateCounter(Long id, CounterInfo counterDetails) {
        CounterInfo counter = counterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Counter not found"));
        counter.setName(counterDetails.getName());
        counter.setLocation(counterDetails.getLocation());
        return counterRepository.save(counter);
    }

    public void deleteCounter(Long id) {
        counterRepository.deleteById(id);
    }

    public void assignProductToCounter(Long counterId, Long productId) {
        CounterInfo counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new RuntimeException("Counter not found"));
        CounterProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        product.setCounter(counter);
        productRepository.save(product);
    }
}
