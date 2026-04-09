package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.SystemUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface SystemUserRepository extends JpaRepository<SystemUser, Long> {
    Optional<SystemUser> findByEmail(String email);
    List<SystemUser> findByRole(String role);
}
