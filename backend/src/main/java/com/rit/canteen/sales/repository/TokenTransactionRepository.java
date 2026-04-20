package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.TokenTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TokenTransactionRepository extends JpaRepository<TokenTransaction, Long> {
    List<TokenTransaction> findByUserIdOrderByTimestampDesc(Long userId);
    List<TokenTransaction> findAllByOrderByTimestampDesc();

    @Query("SELECT SUM(t.amount) FROM TokenTransaction t WHERE t.type = :type")
    BigDecimal sumByType(@Param("type") TokenTransaction.TransactionType type);

    @Query("SELECT SUM(t.amount) FROM TokenTransaction t WHERE t.type = :type AND t.timestamp >= :start AND t.timestamp <= :end")
    BigDecimal sumByTypeInRange(@Param("type") TokenTransaction.TransactionType type, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
