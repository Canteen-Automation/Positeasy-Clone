package com.rit.canteen.sales.counter.service;

import com.rit.canteen.sales.counter.model.CounterCategory;
import com.rit.canteen.sales.counter.repository.CounterCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CounterCategoryService {

    @Autowired
    private CounterCategoryRepository categoryRepository;

    public List<CounterCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<CounterCategory> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    public CounterCategory createCategory(CounterCategory category) {
        return categoryRepository.save(category);
    }

    public CounterCategory updateCategory(Long id, CounterCategory categoryDetails) {
        CounterCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(categoryDetails.getName());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
