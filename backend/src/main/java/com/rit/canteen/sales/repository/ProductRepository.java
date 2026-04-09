package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.stalls")
    List<Product> findAllWithStalls();
    
    List<Product> findByCategory(String category);
}
