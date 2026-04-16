package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.Product;
import com.rit.canteen.sales.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.rit.canteen.sales.repository.StallRepository stallRepository;

    @GetMapping
    public org.springframework.data.domain.Page<Product> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (search != null && !search.isEmpty()) {
            return productRepository.findByNameOrCategoryContainingIgnoreCase(search, org.springframework.data.domain.PageRequest.of(page, size));
        }
        return productRepository.findAllWithStalls(org.springframework.data.domain.PageRequest.of(page, size));
    }

    @GetMapping("/category/{categoryName}")
    public List<Product> getProductsByCategory(@PathVariable String categoryName) {
        return productRepository.findAll().stream()
                .filter(p -> categoryName.equals(p.getCategory()))
                .toList();
    }

    @PostMapping
    @org.springframework.transaction.annotation.Transactional
    public Product createProduct(@Valid @RequestBody Product product) {
        Product savedProduct = productRepository.save(product);
        updateStallAssociations(savedProduct, product.getStalls());
        return productRepository.findById(savedProduct.getId()).orElse(savedProduct);
    }

    @PutMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @Valid @RequestBody Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setProductId(productDetails.getProductId());
                    product.setName(productDetails.getName());
                    product.setCategory(productDetails.getCategory());
                    product.setDescription(productDetails.getDescription());
                    product.setBasePrice(productDetails.getBasePrice());
                    product.setPrice(productDetails.getPrice());
                    product.setOfferPrice(productDetails.getOfferPrice());
                    product.setDiscountPercent(productDetails.getDiscountPercent());
                    product.setDiscountAmount(productDetails.getDiscountAmount());
                    product.setCounter(productDetails.getCounter());
                    product.setTag(productDetails.getTag());
                    product.setParcelCharges(productDetails.getParcelCharges());
                    product.setBarcode(productDetails.getBarcode());
                    product.setAttributesOptional(productDetails.isAttributesOptional());
                    product.setVeg(productDetails.isVeg());
                    product.setHasAllergy(productDetails.isHasAllergy());
                    product.setParcelNotAllowed(productDetails.isParcelNotAllowed());
                    product.setSessionOptional(productDetails.isSessionOptional());
                    
                    product.getSessions().clear();
                    if (productDetails.getSessions() != null) {
                        product.getSessions().addAll(productDetails.getSessions());
                    }
                    
                    product.setImageData(productDetails.getImageData());
                    product.setActive(productDetails.isActive());
                    product.setStock(productDetails.getStock());
                    
                    Product updated = productRepository.save(product);
                    updateStallAssociations(updated, productDetails.getStalls());
                    
                    return ResponseEntity.ok(productRepository.findById(updated.getId()).orElse(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void updateStallAssociations(Product product, List<com.rit.canteen.sales.model.Stall> assignedStalls) {
        // Remove product from all stalls currently associated
        List<com.rit.canteen.sales.model.Stall> allStalls = stallRepository.findAll();
        for (com.rit.canteen.sales.model.Stall stall : allStalls) {
            if (stall.getProducts() != null && stall.getProducts().removeIf(p -> p.getId().equals(product.getId()))) {
                stallRepository.save(stall);
            }
        }

        // Add product to the newly assigned stalls
        if (assignedStalls != null) {
            for (com.rit.canteen.sales.model.Stall assignedStall : assignedStalls) {
                stallRepository.findById(assignedStall.getId()).ifPresent(stall -> {
                    if (stall.getProducts() == null) {
                        stall.setProducts(new java.util.ArrayList<>());
                    }
                    if (stall.getProducts().stream().noneMatch(p -> p.getId().equals(product.getId()))) {
                        stall.getProducts().add(product);
                        stallRepository.save(stall);
                    }
                });
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    productRepository.delete(product);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle-stock")
    public ResponseEntity<Product> toggleStock(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> {
                    Integer currentStock = product.getStock() != null ? product.getStock() : 0;
                    product.setStock(currentStock > 0 ? 0 : 99); // Toggle between Out of Stock and In Stock
                    return ResponseEntity.ok(productRepository.save(product));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
