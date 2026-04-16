package com.rit.canteen.sales.counter.repository;

import com.rit.canteen.sales.counter.model.CounterOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CounterOrderRepository extends JpaRepository<CounterOrder, Long> {
    List<CounterOrder> findByStatus(String status);
    List<CounterOrder> findAllByOrderByCreatedAtDesc();
}
