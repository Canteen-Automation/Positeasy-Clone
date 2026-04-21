package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.CouponCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface CouponRepository extends JpaRepository<CouponCode, Long> {
    Optional<CouponCode> findByCode(String code);
    List<CouponCode> findByExpiryDateBeforeAndIsActiveTrue(LocalDateTime threshold);
}
