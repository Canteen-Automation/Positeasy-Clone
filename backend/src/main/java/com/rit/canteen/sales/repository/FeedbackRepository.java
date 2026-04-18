package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.Feedback;
import com.rit.canteen.sales.model.ItemRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByOrderId(Long orderId);
    boolean existsByOrderId(Long orderId);
    Page<Feedback> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT AVG(ir.rating) FROM ItemRating ir")
    Double getAverageRating();

    @Query("SELECT ir.rating, COUNT(ir) FROM ItemRating ir GROUP BY ir.rating")
    List<Object[]> getRatingDistribution();

    @Query("SELECT ir.productName, AVG(ir.rating), COUNT(ir) FROM ItemRating ir GROUP BY ir.productName ORDER BY AVG(ir.rating) DESC")
    List<Object[]> getTopRatedItems();

    @Query("SELECT ir.rating, COUNT(ir) FROM ItemRating ir WHERE TRIM(LOWER(ir.productName)) = TRIM(LOWER(:productName)) GROUP BY ir.rating")
    List<Object[]> getItemRatingDistribution(@org.springframework.data.repository.query.Param("productName") String productName);
}
