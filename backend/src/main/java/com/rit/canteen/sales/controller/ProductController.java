package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.Product;
import com.rit.canteen.sales.repository.ProductRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.rit.canteen.sales.service.SystemNotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.rit.canteen.sales.repository.StallRepository stallRepository;

    @Autowired
    private StockUpdateController stockUpdateController;

    @Autowired
    private SystemNotificationService notificationService;

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

    @GetMapping("/drafts")
    public List<Product> getDraftProducts() {
        return productRepository.findByIsDraftTrue();
    }

    @GetMapping("/category/{categoryName}")
    public List<Product> getProductsByCategory(@PathVariable String categoryName) {
        return productRepository.findByCategory(categoryName);
    }
    
    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return productRepository.findDistinctCategories();
    }

    @PostMapping
    @org.springframework.transaction.annotation.Transactional
    public Product createProduct(@Valid @RequestBody Product product) {
        Product savedProduct = productRepository.save(product);
        updateStallAssociations(savedProduct, product.getStalls());
        
        if (savedProduct.isDraft()) {
            notificationService.createNotification(
                "Draft Product Created",
                "A new product draft '" + savedProduct.getName() + "' has been created and requires review before publishing.",
                "PRODUCT",
                "/inventory/products"
            );
        }
        
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
                    
                    // Broadcast update
                    stockUpdateController.broadcastStockUpdate(updated.getId(), updated.getStock());
                    
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
                    Product saved = productRepository.save(product);
                    stockUpdateController.broadcastStockUpdate(saved.getId(), saved.getStock());
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/stock-adjust")
    public ResponseEntity<Product> adjustStock(@PathVariable Long id, @RequestParam int delta) {
        return productRepository.findById(id)
                .map(product -> {
                    int currentStock = product.getStock() != null ? product.getStock() : 0;
                    product.setStock(Math.max(0, currentStock + delta));
                    Product saved = productRepository.save(product);
                    stockUpdateController.broadcastStockUpdate(saved.getId(), saved.getStock());
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/batch-assign-category")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Void> batchAssignCategory(@RequestBody java.util.Map<String, Object> payload) {
        String categoryName = (String) payload.get("categoryName");
        List<Integer> productIds = (List<Integer>) payload.get("productIds");
        
        if (categoryName == null || productIds == null) return ResponseEntity.badRequest().build();
        
        for (Integer id : productIds) {
            productRepository.findById(id.longValue()).ifPresent(p -> {
                p.setCategory(categoryName);
                productRepository.save(p);
            });
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/publish")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Product> publishProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        return productRepository.findById(id)
                .map(product -> {
                    String finalProductId = productDetails.getProductId();
                    
                    // If it's a draft ID or blank, try to find an existing live product by name first
                    if (finalProductId == null || finalProductId.startsWith("DRAFT-") || finalProductId.isEmpty()) {
                        List<Product> nameMatches = productRepository.findByNameRobust(productDetails.getName());
                        if (!nameMatches.isEmpty()) {
                            finalProductId = nameMatches.get(0).getProductId();
                        }
                    }
                    
                    // If still a draft ID or blank, generate a new PRD ID
                    if (finalProductId == null || finalProductId.startsWith("DRAFT-") || finalProductId.isEmpty()) {
                        finalProductId = "PRD-" + String.format("%04d", new java.util.Random().nextInt(10000));
                    }

                    // Check if a live product with this ID already exists (to merge)
                    final String targetId = finalProductId;
                    java.util.Optional<Product> existingLive = productRepository.findByProductIdRobust(targetId);

                    if (existingLive.isPresent()) {
                        Product live = existingLive.get();
                        // MERGE: Update stock and other details
                        live.setStock((live.getStock() != null ? live.getStock() : 0) + (productDetails.getStock() != null ? productDetails.getStock() : 0));
                        live.setName(productDetails.getName());
                        live.setCategory(productDetails.getCategory());
                        live.setDescription(productDetails.getDescription());
                        live.setBasePrice(productDetails.getBasePrice());
                        live.setPrice(productDetails.getPrice());
                        live.setOfferPrice(productDetails.getOfferPrice());
                        live.setCounter(productDetails.getCounter());
                        live.setTag(productDetails.getTag());
                        live.setImageData(productDetails.getImageData());
                        live.setDraft(false);
                        live.setActive(true);
                        
                        Product savedLive = productRepository.save(live);
                        productRepository.delete(product); // Delete the draft
                        updateStallAssociations(savedLive, productDetails.getStalls());
                        return ResponseEntity.ok(productRepository.findById(savedLive.getId()).orElse(savedLive));
                    } else {
                        // CREATE/UPDATE as new live product
                        product.setName(productDetails.getName());
                        product.setProductId(finalProductId);
                        product.setCategory(productDetails.getCategory());
                        product.setDescription(productDetails.getDescription());
                        product.setBasePrice(productDetails.getBasePrice());
                        product.setPrice(productDetails.getPrice());
                        product.setOfferPrice(productDetails.getOfferPrice());
                        product.setCounter(productDetails.getCounter());
                        product.setTag(productDetails.getTag());
                        product.setBarcode(productDetails.getBarcode());
                        product.setImageData(productDetails.getImageData());
                        product.setStock(productDetails.getStock());
                        
                        product.getSessions().clear();
                        if (productDetails.getSessions() != null) {
                            product.getSessions().addAll(productDetails.getSessions());
                        }
                        
                        // Finalize
                        product.setDraft(false);
                        product.setActive(true);
                        
                        Product updated = productRepository.save(product);
                        updateStallAssociations(updated, productDetails.getStalls());
                        
                        notificationService.createNotification(
                            "Product Published",
                            "Product '" + productDetails.getName() + "' is now live in the inventory with ID: " + finalProductId,
                            "PRODUCT",
                            "/inventory/products"
                        );

                        return ResponseEntity.ok(productRepository.findById(updated.getId()).orElse(updated));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
