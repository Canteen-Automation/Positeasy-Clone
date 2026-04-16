package com.rit.canteen.sales.counter.repository;

import com.rit.canteen.sales.counter.model.CounterCategory;
import com.rit.canteen.sales.counter.model.CounterProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CounterProductRepository extends JpaRepository<CounterProduct, Long> {
    List<CounterProduct> findByCategoryName(String categoryName);
    List<CounterProduct> findByCategory(CounterCategory category);
}
