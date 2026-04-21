package com.rit.canteen.sales.controller;

import com.rit.canteen.sales.model.SystemUser;
import com.rit.canteen.sales.service.SystemUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/system")
public class SystemAuthController {

    @Autowired
    private SystemUserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        Optional<SystemUser> user = userService.authenticate(email, password);
        
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @GetMapping("/managers")
    public ResponseEntity<List<SystemUser>> getManagers() {
        return ResponseEntity.ok(userService.getAllManagers());
    }

    @PostMapping("/managers")
    public ResponseEntity<SystemUser> addManager(@RequestBody SystemUser manager) {
        return ResponseEntity.ok(userService.createManager(manager));
    }

    @DeleteMapping("/managers/{id}")
    public ResponseEntity<Void> deleteManager(@PathVariable Long id) {
        userService.deleteManager(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/staff")
    public ResponseEntity<List<SystemUser>> getStaff() {
        return ResponseEntity.ok(userService.getAllStaff());
    }

    @PostMapping("/staff")
    public ResponseEntity<SystemUser> addStaff(@RequestBody SystemUser staff) {
        return ResponseEntity.ok(userService.createStaff(staff));
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        userService.deleteManager(id); // Using existing delete logic
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admins")
    public ResponseEntity<List<SystemUser>> getAdmins() {
        return ResponseEntity.ok(userService.getMasters());
    }

    @PostMapping("/admins")
    public ResponseEntity<SystemUser> addAdmin(@RequestBody SystemUser admin) {
        return ResponseEntity.ok(userService.createMaster(admin));
    }

    @PostMapping("/update-master")
    public ResponseEntity<?> updateMaster(@RequestBody Map<String, Object> data) {
        try {
            Object idObj = data.get("id");
            Long id = (idObj != null) ? Long.valueOf(idObj.toString()) : 0L;
            
            String email = (String) data.get("email");
            String password = (String) data.get("password");
            String name = (String) data.get("name");
            
            userService.updateMasterAccount(id, email, password, name);
            return ResponseEntity.ok(Map.of("success", true, "message", "Credentials updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
