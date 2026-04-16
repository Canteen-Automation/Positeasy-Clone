package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobileNumber(String mobileNumber);
    boolean existsByMobileNumber(String mobileNumber);
    
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR u.mobileNumber LIKE CONCAT('%', :search, '%')")
    org.springframework.data.domain.Page<User> findByNameOrMobileContainingIgnoreCase(String search, org.springframework.data.domain.Pageable pageable);
}
