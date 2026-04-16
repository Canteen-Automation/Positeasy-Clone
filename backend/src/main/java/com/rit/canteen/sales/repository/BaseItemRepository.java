package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.BaseItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BaseItemRepository extends JpaRepository<BaseItem, Long> {
    boolean existsByName(String name);
    Page<BaseItem> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
