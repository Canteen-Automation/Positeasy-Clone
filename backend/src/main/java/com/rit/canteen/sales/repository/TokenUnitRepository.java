package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.TokenUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TokenUnitRepository extends JpaRepository<TokenUnit, Long> {
    
    @Query(value = "SELECT * FROM token_units WHERE owner_id = :ownerId AND status = 'ACTIVE' ORDER BY id ASC LIMIT :amount", nativeQuery = true)
    List<TokenUnit> findActiveUnits(@Param("ownerId") Long ownerId, @Param("amount") int amount);

    List<TokenUnit> findByOrderRef(String orderRef);
    
    long countByOwnerIdAndStatus(Long ownerId, TokenUnit.TokenStatus status);
    
    org.springframework.data.domain.Page<TokenUnit> findAllByOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);
}
