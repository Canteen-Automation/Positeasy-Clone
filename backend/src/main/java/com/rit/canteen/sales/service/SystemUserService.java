package com.rit.canteen.sales.service;

import com.rit.canteen.sales.model.SystemUser;
import com.rit.canteen.sales.repository.SystemUserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SystemUserService {

    @Autowired
    private SystemUserRepository repository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Value("${app.master.username:admin}")
    private String masterUsername;

    @Value("${app.master.password:admin}")
    private String masterPassword;

    @PostConstruct
    public void init() {
        // Handle migration from old credentials if they exist
        repository.findByEmail("admin@ritcanteen.com").ifPresent(oldUser -> {
            boolean hasNewAdmin = repository.findByEmail("admin").isPresent();
            if (hasNewAdmin) {
                repository.delete(oldUser);
                System.out.println(">>> REMOVED OBSOLETE MASTER USER: admin@ritcanteen.com");
            } else {
                oldUser.setEmail(masterUsername);
                oldUser.setPassword(passwordEncoder.encode(masterPassword));
                repository.save(oldUser);
                System.out.println(">>> MIGRATED MASTER USER: admin / admin");
            }
        });

        // Ensure 'admin' user exists and has the correct password
        Optional<SystemUser> adminUser = repository.findByEmail(masterUsername);
        if (adminUser.isPresent()) {
            SystemUser admin = adminUser.get();
            admin.setPassword(passwordEncoder.encode(masterPassword));
            admin.setRole("MASTER");
            repository.save(admin);
            System.out.println(">>> UPDATED MASTER USER PASSWORD: " + masterUsername + " / " + masterPassword);
        } else {
            SystemUser master = new SystemUser();
            master.setName("Admin Master");
            master.setEmail(masterUsername);
            master.setPassword(passwordEncoder.encode(masterPassword));
            master.setRole("MASTER");
            master.setPermissions(List.of("dashboard", "sale", "customers", "purchases", "inventory", "expense", "reports", "stores", "table", "wallet", "promotions", "feedback"));
            master.setViewOnly(false);
            repository.save(master);
            System.out.println(">>> SEEDED MASTER USER: " + masterUsername + " / " + masterPassword);
        }
    }

    public List<SystemUser> getAllManagers() {
        return repository.findByRole("MANAGER");
    }

    public SystemUser createManager(SystemUser manager) {
        manager.setRole("MANAGER");
        manager.setPassword(passwordEncoder.encode(manager.getPassword()));
        return repository.save(manager);
    }

    public List<SystemUser> getAllStaff() {
        return repository.findByRole("STAFF");
    }

    public SystemUser createStaff(SystemUser staff) {
        staff.setRole("STAFF");
        staff.setPassword(passwordEncoder.encode(staff.getPassword()));
        return repository.save(staff);
    }

    public void deleteManager(Long id) {
        if (id != null) {
            repository.deleteById(id);
        }
    }

    public Optional<SystemUser> authenticate(String email, String password) {
        System.out.println(">>> Attempting authentication for: " + email);
        Optional<SystemUser> user = repository.findByEmail(email);
        if (user.isPresent()) {
            boolean matches = passwordEncoder.matches(password, user.get().getPassword());
            System.out.println(">>> User found. Password match: " + matches);
            if (matches) {
                return user;
            }
        } else {
            System.out.println(">>> User NOT found: " + email);
        }
        return Optional.empty();
    }
}
