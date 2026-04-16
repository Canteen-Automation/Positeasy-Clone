package com.rit.canteen.sales.counter.service;

import com.rit.canteen.sales.counter.model.CounterProduct;
import com.rit.canteen.sales.counter.repository.CounterProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CounterProductService {

    @Autowired
    private CounterProductRepository productRepository;

    public List<CounterProduct> getAllProducts() {
        return productRepository.findAll();
    }

    public List<CounterProduct> getProductsByCategory(String categoryName) {
        return productRepository.findByCategoryName(categoryName);
    }

    public Optional<CounterProduct> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public CounterProduct createProduct(CounterProduct product) {
        return productRepository.save(product);
    }

    public CounterProduct updateProduct(Long id, CounterProduct productDetails) {
        CounterProduct product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());
        product.setStock(productDetails.getStock());
        product.setDescription(productDetails.getDescription());
        product.setImageUrl(productDetails.getImageUrl());
        product.setCategory(productDetails.getCategory());
        product.setCounter(productDetails.getCounter());
        
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public CounterProduct updateStock(Long productId, Integer quantity) {
        CounterProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStock(product.getStock() - quantity);
        return productRepository.save(product);
    }
}
