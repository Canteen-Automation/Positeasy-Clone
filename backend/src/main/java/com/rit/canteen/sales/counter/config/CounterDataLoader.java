package com.rit.canteen.sales.counter.config;

import com.rit.canteen.sales.counter.model.CounterCategory;
import com.rit.canteen.sales.counter.model.CounterProduct;
import com.rit.canteen.sales.counter.repository.CounterCategoryRepository;
import com.rit.canteen.sales.counter.repository.CounterProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CounterDataLoader {

    @Bean
    CommandLineRunner initCounterDatabase(CounterCategoryRepository categoryRepository, CounterProductRepository productRepository) {
        return args -> {
            if (categoryRepository.count() == 0) {
                CounterCategory iceCream = categoryRepository.save(new CounterCategory("ICE CREAM"));
                CounterCategory biscuit = categoryRepository.save(new CounterCategory("BISCUIT"));
                CounterCategory juice = categoryRepository.save(new CounterCategory("READYMADE JUICE"));
                CounterCategory chocolate = categoryRepository.save(new CounterCategory("CHOCOLATE"));
                CounterCategory snacks = categoryRepository.save(new CounterCategory("SNACKS"));
                CounterCategory bakery = categoryRepository.save(new CounterCategory("BAKERY"));

                List<CounterProduct> products = Arrays.asList(
                    new CounterProduct("CM BUTTER SCOTCH CONE", 40.0, 47, iceCream),
                    new CounterProduct("CM CHOCOLATE CONE", 50.0, 24, iceCream),
                    new CounterProduct("CM COOKIES AND CREAM", 50.0, 58, iceCream),
                    new CounterProduct("CM SIPUP CHOCOLATE", 10.0, 111, iceCream),
                    new CounterProduct("CM SIPUP STRAWBERRY", 10.0, 118, iceCream),
                    new CounterProduct("CM SIPUP PINEAPPLE", 10.0, 120, iceCream),
                    new CounterProduct("CM VANILLA CUP", 10.0, 31, iceCream),
                    new CounterProduct("CM PINE APPLE STICK ICE", 10.0, 25, iceCream),
                    new CounterProduct("CM MINI VANILLA CONE", 20.0, 128, iceCream),
                    new CounterProduct("CM PISTA STICK ICE", 20.0, 25, iceCream),
                    new CounterProduct("CM BALL ICE CREAM", 20.0, 18, iceCream),
                    new CounterProduct("CM CHOCOBAR WITH POUCH", 30.0, 100, iceCream),
                    new CounterProduct("CM DILSE BUTTER/CHOCO", 30.0, 18, iceCream),
                    new CounterProduct("CM DILSE REDVEL/VANILLA", 40.0, 20, iceCream),
                    new CounterProduct("CM SIPUP PISTA", 10.0, 118, iceCream),
                    new CounterProduct("COCONUT ICE CREAM", 45.0, 30, iceCream),
                    new CounterProduct("Coke", 25.0, 100, juice)
                );
                productRepository.saveAll(products);
                
                System.out.println("Counter Database seeded with initial categories and products.");
            }
        };
    }
}
