package com.rit.canteen.sales.repository;

import com.rit.canteen.sales.model.Stall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StallRepository extends JpaRepository<Stall, Long> {
    List<Stall> findByActiveTrue();
}
