package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.SystemNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, Long> {
    List<SystemNotification> findByIsReadFalseOrderByCreatedAtDesc();
    List<SystemNotification> findAllByOrderByCreatedAtDesc();
}
