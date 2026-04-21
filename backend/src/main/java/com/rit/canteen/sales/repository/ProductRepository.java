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
    
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL")
    List<String> findDistinctCategories();

    List<Product> findByIsDraftTrue();

    @Query("SELECT p FROM Product p WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(:name)) AND (p.isDraft = false OR p.isDraft IS NULL)")
    List<Product> findByNameRobust(@org.springframework.data.repository.query.Param("name") String name);

    @Query("SELECT p FROM Product p WHERE p.productId = :productId AND (p.isDraft = false OR p.isDraft IS NULL)")
    java.util.Optional<Product> findByProductIdRobust(@org.springframework.data.repository.query.Param("productId") String productId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.stalls WHERE p.id = :id")
    java.util.Optional<Product> findByIdWithStalls(@org.springframework.data.repository.query.Param("id") Long id);
    
    boolean existsByNameAndCategory(String name, String category);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Product p SET p.stock = p.stock - :quantity WHERE p.id = :id AND p.stock >= :quantity")
    int decrementStock(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("quantity") int quantity);
}
