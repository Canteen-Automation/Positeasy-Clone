package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, Long> {
    @Query(value = "SELECT * FROM system_notifications WHERE is_read = false ORDER BY created_at DESC", nativeQuery = true)
    List<SystemNotification> findByReadStatusFalse();
    
    List<SystemNotification> findAllByOrderByCreatedAtDesc();
}
