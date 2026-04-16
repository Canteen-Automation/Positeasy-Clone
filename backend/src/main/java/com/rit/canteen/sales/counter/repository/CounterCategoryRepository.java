package com.rit.canteen.sales.counter.repository;

import com.rit.canteen.sales.counter.model.CounterCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CounterCategoryRepository extends JpaRepository<CounterCategory, Long> {
    Optional<CounterCategory> findByName(String name);
}
