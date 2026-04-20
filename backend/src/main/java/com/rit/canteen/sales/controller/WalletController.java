package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.TokenTransaction;
import com.rit.canteen.sales.model.User;
import com.rit.canteen.sales.service.TokenService;
import com.rit.canteen.sales.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private com.rit.canteen.sales.repository.UserRepository userRepository;

    @Autowired
    private com.rit.canteen.sales.service.TokenService tokenService;

    @GetMapping("/balance/{userId}")
    public ResponseEntity<?> getBalance(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            
            if (user == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(Map.of("balance", user.getRitzTokenBalance()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/transactions/{userId}")
    public ResponseEntity<List<TokenTransaction>> getTransactions(@PathVariable Long userId) {
        return ResponseEntity.ok(tokenService.getTransactions(userId));
    }

    @PostMapping("/topup")
    public ResponseEntity<?> topUp(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String ref = request.getOrDefault("referenceId", "TOPUP-" + System.currentTimeMillis()).toString();

            User updatedUser = tokenService.topUp(userId, amount, ref);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "newBalance", updatedUser.getRitzTokenBalance(),
                "message", "Successfully added " + amount + " Ritz Tokens"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
