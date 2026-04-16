package com.rit.canteen.sales.counter.controller;

import com.rit.canteen.sales.model.BaseItem;
import com.rit.canteen.sales.repository.BaseItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/counter/categories")
public class CounterCategoryController {

    @Autowired
    private BaseItemRepository baseItemRepository;

    @GetMapping
    public List<BaseItem> getAllCategories() {
        return baseItemRepository.findAll();
    }

    // Management endpoints are disabled for the counter billing dashboard
}
