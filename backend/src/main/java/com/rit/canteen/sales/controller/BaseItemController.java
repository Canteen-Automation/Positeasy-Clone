package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.BaseItem;
import com.rit.canteen.sales.repository.BaseItemRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/base-items")
public class BaseItemController {

    @Autowired
    private BaseItemRepository baseItemRepository;

    @GetMapping
    public List<BaseItem> getAllBaseItems() {
        return baseItemRepository.findAll();
    }

    @PostMapping
    public BaseItem createBaseItem(@Valid @RequestBody BaseItem baseItem) {
        return baseItemRepository.save(baseItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseItem> updateBaseItem(@PathVariable Long id, @Valid @RequestBody BaseItem baseItemDetails) {
        return baseItemRepository.findById(id)
                .map(item -> {
                    item.setName(baseItemDetails.getName());
                    item.setDescription(baseItemDetails.getDescription());
                    item.setActive(baseItemDetails.isActive());
                    return ResponseEntity.ok(baseItemRepository.save(item));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
