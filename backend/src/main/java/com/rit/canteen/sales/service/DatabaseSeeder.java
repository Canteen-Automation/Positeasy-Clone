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
        seedCategories();
        seedProducts();
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
        String[][] categories = {
            {"Fast Food", "Burgers, Pizzas and more"},
            {"Indian Main Course", "Traditional Indian meals"},
            {"Chinese", "Oriental flavors"},
            {"Beverages & Drinks", "Refreshing drinks and coffee"},
            {"Healthy & Salads", "Nutritious and light options"},
            {"Snacks & Quick Bites", "Classic street food and snacks"},
            {"Bakery & Sweets", "Cakes, pastries and desserts"}
        };

        for (String[] cat : categories) {
            if (!baseItemRepository.existsByName(cat[0])) {
                baseItemRepository.save(new BaseItem(cat[0], cat[1], true));
                System.out.println("Seeded category: " + cat[0]);
            }
        }
    }

    private void seedProducts() {
        // Fast Food
        addProductsToCategory("Fast Food", new String[]{
            "Veg Burger", "Chicken Burger", "Cheese Burger", "Double Patty Burger", "Spicy Zinger Burger", 
            "Paneer Burger", "Aloha Burger", "Mushroom Burger", "Fish Burger", "BBQ Burger",
            "Margherita Pizza", "Farmhouse Pizza", "Peppy Paneer", "Mexican Wave", "Pepper BBQ Chicken", 
            "Chicken Tikka Pizza", "Meat Lover's Pizza", "Veggie Paradise", "Corn & Cheese Pizza", "Double Cheese Margherita",
            "Classic Fries", "Peri Peri Fries", "Cheese Loaded Fries", "Onion Rings", "Garlic Bread Sticks"
        }, 50.0, 350.0);

        // Indian Main Course
        addProductsToCategory("Indian Main Course", new String[]{
            "Paneer Butter Masala", "Kadai Paneer", "Palak Paneer", "Matar Paneer", "Paneer Tikka Masala",
            "Dal Makhani", "Dal Tadka", "Yellow Dal Fry", "Chole Masala", "Rajma Masala",
            "Veg Kolhapuri", "Mix Veg", "Malai Kofta", "Bhindi Do Pyaza", "Aloo Gobi",
            "Butter Chicken", "Chicken Tikka Masala", "Mutton Rogan Josh", "Egg Curry", "Fish Curry",
            "Jeera Rice", "Steamed Rice", "Veg Pulao", "Peas Pulao", "Kashmiri Pulao"
        }, 100.0, 450.0);

        // Chinese
        addProductsToCategory("Chinese", new String[]{
            "Veg Hakka Noodles", "Schezwan Noodles", "Chilli Garlic Noodles", "Singapore Noodles", "Manchow Noodles",
            "Veg Fried Rice", "Egg Fried Rice", "Chicken Fried Rice", "Mixed Fried Rice", "Schezwan Fried Rice",
            "Veg Manchurian", "Chicken Manchurian", "Gobi Manchurian", "Baby Corn Manchurian", "Mushroom Manchurian",
            "Chilli Paneer", "Chilli Chicken", "Chilli Potato", "Crispy Corn", "Spring Rolls",
            "Hot and Sour Soup", "Sweet Corn Soup", "Lemon Coriander Soup", "Clear Soup", "Wonton Soup"
        }, 80.0, 280.0);

        // Beverages & Drinks
        addProductsToCategory("Beverages & Drinks", new String[]{
            "Fresh Lime Soda", "Virgin Mojito", "Blue Lagoon", "Iced Tea", "Cold Coffee",
            "Mango Shake", "Oreo Shake", "Chocolate Shake", "Strawberry Shake", "Vanilla Shake",
            "Masala Tea", "Ginger Tea", "Green Tea", "Black Coffee", "Cappuccino", "Latte",
            "Orange Juice", "Watermelon Juice", "Pineapple Juice", "Mixed Fruit Juice", "Mosambi Juice",
            "Coca Cola", "Pepsi", "Sprite", "Fanta", "Mineral Water"
        }, 20.0, 180.0);

        // Healthy & Salads
        addProductsToCategory("Healthy & Salads", new String[]{
            "Caesar Salad", "Greek Salad", "Garden Salad", "Fruit Salad", "Russian Salad",
            "Sprouted Moong Salad", "Chickpea Salad", "Cucumber Salad", "Tomato Onion Salad", "Beetroot Salad",
            "Grilled Chicken Salad", "Tuna Salad", "Boiled Egg Salad", "Paneer Salad", "Tofu Salad",
            "Vegetable Clear Soup", "Quinoa Bowl", "Brown Rice Bowl", "Steamed Vegetables", "Sautéed Spinach"
        }, 120.0, 320.0);

        // Snacks & Quick Bites
        addProductsToCategory("Snacks & Quick Bites", new String[]{
            "Samosa", "Vada Pav", "Batata Vada", "Bread Pakoda", "Paneer Pakoda",
            "Veg Sandwich", "Cheese Sandwich", "Grilled Sandwich", "Corn Sandwich", "Bombay Sandwich",
            "Pani Puri", "Bhel Puri", "Sev Puri", "Dahi Puri", "Aloo Tikki",
            "Pav Bhaji", "Misal Pav", "Poha", "Upma", "Idli Sambhar",
            "Medu Vada", "Masala Dosa", "Onion Uttapam", "Plain Dosa", "Cheese Dosa"
        }, 15.0, 150.0);

        // Bakery & Sweets
        addProductsToCategory("Bakery & Sweets", new String[]{
            "Chocolate Cake", "Pineapple Cake", "Black Forest Cake", "Red Velvet Cake", "Butterscotch Cake",
            "Chocolate Brownie", "Walnut Brownie", "Apple Pie", "Cheesecake", "Fruit Tart",
            "Gulab Jamun", "Rasgulla", "Kaju Katli", "Motichoor Ladoo", "Jalebi",
            "Vanilla Muffin", "Choco Chip Cookie", "Oatmeal Cookie", "Crossiant", "Danish Pastry"
        }, 40.0, 250.0);

        System.out.println("Products seeding check complete!");
    }

    private void addProductsToCategory(String category, String[] productNames, double minPrice, double maxPrice) {
        java.util.Random random = new java.util.Random();
        List<Product> productsToSave = new java.util.ArrayList<>();
        
        for (String name : productNames) {
            if (!productRepository.existsByNameAndCategory(name, category)) {
                double price = minPrice + (maxPrice - minPrice) * random.nextDouble();
                price = Math.round(price / 5.0) * 5.0; // Round to nearest 5
                
                int stock = random.nextInt(100);
                boolean isVeg = !name.toLowerCase().contains("chicken") && 
                               !name.toLowerCase().contains("meat") && 
                               !name.toLowerCase().contains("fish") && 
                               !name.toLowerCase().contains("egg") &&
                               !name.toLowerCase().contains("mutton") &&
                               !name.toLowerCase().contains("tuna");
                
                Product p = createProduct(name, category, name + " prepared fresh with quality ingredients.", price, stock, isVeg);
                p.setProductId("PRD-" + String.format("%04d", random.nextInt(10000)));
                productsToSave.add(p);
            }
        }
        if (!productsToSave.isEmpty()) {
            productRepository.saveAll(productsToSave);
            System.out.println("Seeded " + productsToSave.size() + " new products in " + category);
        }
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
