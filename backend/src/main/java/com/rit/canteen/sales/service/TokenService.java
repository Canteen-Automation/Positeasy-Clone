package com.rit.canteen.sales.service;

import com.rit.canteen.sales.model.TokenTransaction;
import com.rit.canteen.sales.model.User;
import com.rit.canteen.sales.repository.TokenTransactionRepository;
import com.rit.canteen.sales.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TokenService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenTransactionRepository transactionRepository;

    public List<TokenTransaction> getTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    @Transactional
    public User topUp(Long userId, BigDecimal amount, String paymentRef) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal currentBalance = user.getRitzTokenBalance() != null ? user.getRitzTokenBalance() : BigDecimal.ZERO;
        user.setRitzTokenBalance(currentBalance.add(amount));
        User savedUser = userRepository.save(user);

        TokenTransaction transaction = new TokenTransaction(
                user,
                amount,
                TokenTransaction.TransactionType.TOPUP,
                "Wallet Top Up via UPI/Card",
                paymentRef
        );
        transactionRepository.save(transaction);

        return savedUser;
    }

    @Transactional
    public void spend(Long userId, BigDecimal amount, String orderRef) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal currentBalance = user.getRitzTokenBalance() != null ? user.getRitzTokenBalance() : BigDecimal.ZERO;
        
        if (currentBalance.compareTo(amount) < 0) {
            throw new RuntimeException("INSUFFICIENT_TOKENS");
        }

        user.setRitzTokenBalance(currentBalance.subtract(amount));
        userRepository.save(user);

        TokenTransaction transaction = new TokenTransaction(
                user,
                amount,
                TokenTransaction.TransactionType.SPEND,
                "Food Order Payment",
                orderRef
        );
        transactionRepository.save(transaction);
    }
}
