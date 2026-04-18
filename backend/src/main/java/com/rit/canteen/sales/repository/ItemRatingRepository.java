package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.ItemRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRatingRepository extends JpaRepository<ItemRating, Long> {
    
    @Query(value = "SELECT ir FROM ItemRating ir LEFT JOIN FETCH ir.feedback WHERE TRIM(LOWER(ir.productName)) = TRIM(LOWER(:productName))",
           countQuery = "SELECT COUNT(ir) FROM ItemRating ir WHERE TRIM(LOWER(ir.productName)) = TRIM(LOWER(:productName))")
    Page<ItemRating> findByProductNameIgnoreCase(String productName, Pageable pageable);
}
