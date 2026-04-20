package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.TokenTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TokenTransactionRepository extends JpaRepository<TokenTransaction, Long> {
    List<TokenTransaction> findByUserIdOrderByTimestampDesc(Long userId);
    List<TokenTransaction> findAllByOrderByTimestampDesc();
}
