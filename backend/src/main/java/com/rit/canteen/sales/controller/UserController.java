package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.*;
import com.rit.canteen.sales.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Check if a user exists by mobile number.
     * POST /api/auth/check
     */
    @PostMapping("/check")
    public ResponseEntity<LoginResponse> checkUserExists(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.checkUserExists(request.getMobileNumber());
        return ResponseEntity.ok(response);
    }

    /**
     * Register a new user with mobile number, name and PIN.
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> registerUser(@Valid @RequestBody PinVerificationRequest request) {
        LoginResponse response = userService.registerUser(request.getMobileNumber(), request.getName(), request.getPin());
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Verify PIN and login an existing user.
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody PinVerificationRequest request) {
        LoginResponse response = userService.verifyPinAndLogin(request.getMobileNumber(), request.getPin());
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Logout a user.
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<LoginResponse> logout(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.logout(request.getMobileNumber());
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Change user PIN.
     * POST /api/auth/change-pin
     */
    @PostMapping("/change-pin")
    public ResponseEntity<LoginResponse> changePin(@Valid @RequestBody ChangePinRequest request) {
        LoginResponse response = userService.changePin(request.getMobileNumber(), request.getCurrentPin(), request.getNewPin());
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get user details by mobile number.
     * GET /api/auth/user/{mobileNumber}
     */
    @GetMapping("/user/{mobileNumber}")
    public ResponseEntity<LoginResponse.UserDto> getUser(@PathVariable String mobileNumber) {
        LoginResponse.UserDto userDto = userService.getUserByMobile(mobileNumber);
        if (userDto != null) {
            return ResponseEntity.ok(userDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all registered users for administration dashboard.
     * GET /api/auth/users
     */
    /**
     * Get all registered users for administration dashboard.
     * GET /api/auth/users
     */
    @GetMapping("/users")
    public ResponseEntity<Page<LoginResponse.UserDto>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<LoginResponse.UserDto> users = userService.getAllUsers(search, PageRequest.of(page, size));
        return ResponseEntity.ok(users);
    }

    /**
     * Update user details as an administrator.
     * PUT /api/auth/users/{id}
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<LoginResponse.UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        LoginResponse.UserDto updated = userService.updateUser(id, request.getName(), request.getMobileNumber(), request.getPin());
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a user from the system.
     * DELETE /api/auth/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Toggle user suspension status.
     * PATCH /api/auth/users/{id}/suspend
     */
    @PatchMapping("/users/{id}/suspend")
    public ResponseEntity<LoginResponse.UserDto> toggleSuspension(@PathVariable Long id) {
        LoginResponse.UserDto updated = userService.toggleSuspension(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
