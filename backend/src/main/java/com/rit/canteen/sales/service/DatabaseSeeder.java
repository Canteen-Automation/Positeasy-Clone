package com.rit.canteen.sales.service;

import com.rit.canteen.sales.model.BaseItem;
import com.rit.canteen.sales.model.Product;
import com.rit.canteen.sales.repository.BaseItemRepository;
import com.rit.canteen.sales.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;

import java.math.BigDecimal;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private BaseItemRepository baseItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        repairStallsSchema();
        repairLobColumns();
        if (baseItemRepository.count() == 0) {
            seedCategories();
        }
        if (productRepository.count() == 0) {
            seedProducts();
        }
    }

    private void repairStallsSchema() {
        System.out.println("Checking schema consistency for 'stalls' table...");
        try {
            jdbcTemplate.execute("ALTER TABLE stalls ADD COLUMN IF NOT EXISTS session_optional BOOLEAN DEFAULT FALSE");
            jdbcTemplate.execute("ALTER TABLE stalls ADD COLUMN IF NOT EXISTS temporarily_closed BOOLEAN DEFAULT FALSE");
            System.out.println("Schema consistency confirmed.");
        } catch (Exception e) {
            System.err.println("Schema repair notice (this may happen if columns already exist): " + e.getMessage());
        }
    }

    private void repairLobColumns() {
        System.out.println("Checking image columns for LOB-to-TEXT migration...");
        try {
            // Repair products table
            if (!isColumnTextType("products", "image_data")) {
                System.out.println("Migrating products.image_data to TEXT...");
                try { jdbcTemplate.execute("ALTER TABLE products DROP COLUMN image_data"); } catch (Exception e) {}
                jdbcTemplate.execute("ALTER TABLE products ADD COLUMN image_data TEXT");
            }

            // Repair stalls table
            if (!isColumnTextType("stalls", "image_data")) {
                System.out.println("Migrating stalls.image_data to TEXT...");
                try { jdbcTemplate.execute("ALTER TABLE stalls DROP COLUMN image_data"); } catch (Exception e) {}
                jdbcTemplate.execute("ALTER TABLE stalls ADD COLUMN image_data TEXT");
            }
            
            System.out.println("Image schema check complete.");
        } catch (Exception e) {
            System.err.println("Database migration notice: " + e.getMessage());
        }
    }

    private boolean isColumnTextType(String tableName, String columnName) {
        try {
            String query = "SELECT data_type FROM information_schema.columns WHERE table_name = ? AND column_name = ?";
            String dataType = jdbcTemplate.queryForObject(query, String.class, tableName, columnName);
            return "text".equalsIgnoreCase(dataType);
        } catch (Exception e) {
            return false; // Column might not exist or other error
        }
    }

    private void seedCategories() {
        BaseItem breakfast = new BaseItem("Breakfast", "Morning favorites", true);
        BaseItem lunch = new BaseItem("Lunch", "Hearty meals", true);
        BaseItem snacks = new BaseItem("Snacks", "Quick bites", true);
        BaseItem beverages = new BaseItem("Beverages", "Refreshing drinks", true);
        BaseItem desserts = new BaseItem("Desserts", "Sweet treats", true);

        baseItemRepository.saveAll(List.of(breakfast, lunch, snacks, beverages, desserts));
        System.out.println("Categories seeded!");
    }

    private void seedProducts() {
        Product dosa = createProduct("Masala Dosa", "Breakfast", "Crispy dosa with potato filling", 60.0, 50, true);
        Product poha = createProduct("Poha", "Breakfast", "Flattened rice with onions and spices", 30.0, 40, true);
        Product thali = createProduct("Veg Thali", "Lunch", "Full meal with roti, sabzi, dal and rice", 120.0, 30, true);
        Product biryani = createProduct("Chicken Biryani", "Lunch", "Aromatic rice with spiced chicken", 150.0, 20, false);
        Product samosa = createProduct("Samosa", "Snacks", "Deep fried pastry with potato filling", 15.0, 100, true);
        Product tea = createProduct("Masala Tea", "Beverages", "Traditional Indian spiced tea", 10.0, 200, true);
        Product iceCream = createProduct("Vanilla Ice Cream", "Desserts", "Classic vanilla flavor", 30.0, 0, true); // Out of stock

        productRepository.saveAll(List.of(dosa, poha, thali, biryani, samosa, tea, iceCream));
        System.out.println("Products seeded!");
    }

    private Product createProduct(String name, String category, String desc, Double price, Integer stock, boolean isVeg) {
        Product p = new Product();
        p.setName(name);
        p.setCategory(category);
        p.setDescription(desc);
        p.setPrice(BigDecimal.valueOf(price));
        p.setBasePrice(BigDecimal.valueOf(price * 0.8));
        p.setStock(stock);
        p.setVeg(isVeg);
        p.setActive(true);
        return p;
    }
}
