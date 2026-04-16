package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.stalls " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%'))")
    org.springframework.data.domain.Page<Product> findByNameOrCategoryContainingIgnoreCase(String search, org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.stalls",
           countQuery = "SELECT count(p) FROM Product p")
    org.springframework.data.domain.Page<Product> findAllWithStalls(org.springframework.data.domain.Pageable pageable);
    
    List<Product> findByCategory(String category);
    
    boolean existsByNameAndCategory(String name, String category);
}
