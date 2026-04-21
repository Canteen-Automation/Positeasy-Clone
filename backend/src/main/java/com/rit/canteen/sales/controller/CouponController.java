package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.CouponCode;
import com.rit.canteen.sales.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private com.rit.canteen.sales.repository.CouponRedemptionRepository redemptionRepository;

    @Autowired
    private com.rit.canteen.sales.service.TokenService tokenService;

    @GetMapping
    public List<CouponCode> getAllCoupons() {
        return couponRepository.findAll();
    }

    @PostMapping("/redeem")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> redeemCoupon(@RequestBody Map<String, Object> request) {
        String code = ((String) request.get("code")).toUpperCase().trim();
        Long userId = Long.valueOf(request.get("userId").toString());

        Optional<CouponCode> couponOpt = couponRepository.findByCode(code);
        if (couponOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Invalid coupon code"));
        }

        CouponCode coupon = couponOpt.get();

        // 1. Basic Validations
        if (!coupon.getIsActive()) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Coupon is currently inactive"));
        }

        if (java.time.LocalDateTime.now().isAfter(coupon.getExpiryDate())) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Coupon has expired"));
        }

        // 2. Global Usage Limit
        if (coupon.getCurrentClaims() >= coupon.getMaxClaims()) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Coupon claim limit reached"));
        }

        // 3. Per-User Limit (Single redemption per code)
        if (redemptionRepository.existsByUserIdAndCouponId(userId, coupon.getId())) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "You have already redeemed this code"));
        }

        // 4. Execution
        try {
            // Update coupon stats
            coupon.setCurrentClaims(coupon.getCurrentClaims() + 1);
            couponRepository.save(coupon);

            // Credit tokens
            tokenService.topUp(userId, coupon.getRewardAmount(), "COUPON-" + code);

            // Log redemption
            redemptionRepository.save(new com.rit.canteen.sales.model.CouponRedemption(userId, coupon.getId()));

            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Successfully redeemed " + coupon.getRewardAmount() + " Ritz tokens!",
                "rewardAmount", coupon.getRewardAmount()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Redemption failed: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody CouponCode coupon) {
        if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body("Coupon code already exists");
        }
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        Optional<CouponCode> couponOpt = couponRepository.findById(id);
        if (couponOpt.isPresent()) {
            CouponCode coupon = couponOpt.get();
            coupon.setIsActive(!coupon.getIsActive());
            return ResponseEntity.ok(couponRepository.save(coupon));
        }
        return ResponseEntity.notFound().build();
    }
}
