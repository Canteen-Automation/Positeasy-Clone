package com.rit.canteen.sales.counter.repository;

import com.rit.canteen.sales.counter.model.CounterInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CounterInfoRepository extends JpaRepository<CounterInfo, Long> {
    Optional<CounterInfo> findByName(String name);
}
