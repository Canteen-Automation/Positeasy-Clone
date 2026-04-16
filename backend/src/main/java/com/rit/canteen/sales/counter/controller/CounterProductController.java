package com.rit.canteen.sales.counter.controller;

import com.rit.canteen.sales.model.Product;
import com.rit.canteen.sales.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/counter/products")
public class CounterProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/category/{categoryName}")
    public List<Product> getProductsByCategory(@PathVariable String categoryName) {
        return productRepository.findByCategory(categoryName);
    }

    // Management endpoints are disabled for the counter billing dashboard
}
