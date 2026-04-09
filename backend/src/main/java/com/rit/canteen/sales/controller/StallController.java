package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.BaseItem;
import com.rit.canteen.sales.model.Product;
import com.rit.canteen.sales.model.Stall;
import com.rit.canteen.sales.repository.BaseItemRepository;
import com.rit.canteen.sales.repository.ProductRepository;
import com.rit.canteen.sales.repository.StallRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/stalls")
public class StallController {

    @Autowired
    private StallRepository stallRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BaseItemRepository baseItemRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public List<Stall> getAllStalls() {
        return stallRepository.findAll();
    }

    @GetMapping("/active")
    @Transactional(readOnly = true)
    public List<Stall> getActiveStalls() {
        return stallRepository.findByActiveTrue();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Stall> getStallById(@PathVariable Long id) {
        return stallRepository.findById(id)
                .map(stall -> {
                    // Start with explicitly linked products
                    Set<Product> allProducts = new HashSet<>(stall.getProducts());
                    
                    // Add products from linked BaseItems (categories)
                    if (stall.getBaseItems() != null) {
                        for (BaseItem baseItem : stall.getBaseItems()) {
                            List<Product> categoryProducts = productRepository.findByCategory(baseItem.getName());
                            if (categoryProducts != null) {
                                allProducts.addAll(categoryProducts);
                            }
                        }
                    }
                    
                    // Update the products list in the object before returning
                    // Note: This is transient as the transaction is read-only
                    stall.setProducts(new ArrayList<>(allProducts));
                    
                    return ResponseEntity.ok(stall);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Stall> createStall(@RequestBody Stall stall) {
        Stall savedStall = stallRepository.save(stall);
        return ResponseEntity.ok(savedStall);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Stall> updateStall(@PathVariable Long id, @RequestBody Stall updatedStall) {
        return stallRepository.findById(id)
                .map(stall -> {
                    stall.setName(updatedStall.getName());
                    stall.setDescription(updatedStall.getDescription());
                    if (updatedStall.getImageData() != null) {
                        stall.setImageData(updatedStall.getImageData());
                    }
                    stall.setActive(updatedStall.isActive());
                    stall.setTemporarilyClosed(updatedStall.isTemporarilyClosed());
                    stall.setSessionOptional(updatedStall.isSessionOptional());
                    
                    // Update sessions
                    stall.getSessions().clear();
                    if (updatedStall.getSessions() != null) {
                        stall.getSessions().addAll(updatedStall.getSessions());
                    }
                    
                    return ResponseEntity.ok(stallRepository.save(stall));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStall(@PathVariable Long id) {
        return stallRepository.findById(id)
                .map(stall -> {
                    stallRepository.delete(stall);
                    return ResponseEntity.ok(Map.of("success", true, "message", "Stall deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/items")
    @Transactional
    public ResponseEntity<Stall> updateStallItems(
            @PathVariable Long id, 
            @RequestBody Map<String, List<Long>> itemIds) {
        
        return stallRepository.findById(id)
                .map(stall -> {
                    if (itemIds.containsKey("productIds")) {
                        List<Product> products = productRepository.findAllById(itemIds.get("productIds"));
                        stall.setProducts(products);
                    }
                    if (itemIds.containsKey("baseItemIds")) {
                        List<BaseItem> baseItems = baseItemRepository.findAllById(itemIds.get("baseItemIds"));
                        stall.setBaseItems(baseItems);
                    }
                    return ResponseEntity.ok(stallRepository.save(stall));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
