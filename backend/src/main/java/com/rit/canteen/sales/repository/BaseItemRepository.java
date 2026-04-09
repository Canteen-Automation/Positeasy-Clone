package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.BaseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BaseItemRepository extends JpaRepository<BaseItem, Long> {
    boolean existsByName(String name);
}
