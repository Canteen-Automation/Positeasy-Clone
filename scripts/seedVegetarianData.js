const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const categories = [
  { name: 'Traditional Breakfast', description: 'Freshly made morning staples' },
  { name: 'Main Course (Veg)', description: 'Hearty vegetarian entrees' },
  { name: 'Indo-Chinese', description: 'Spicy fusion favorites' },
  { name: 'Sips & Shakes', description: 'Refreshing drinks and blends' },
  { name: 'Indian Desserts', description: 'Sweet traditional endings' }
];

const stalls = [
  { id: 'S1', name: 'Morning Star', active: true },
  { id: 'S2', name: 'The Green Kitchen', active: true },
  { id: 'S3', name: 'Spices of India', active: true },
  { id: 'S4', name: 'The Refreshery', active: true }
];

const products = [
  // Breakfast - Morning Star
  { name: 'Masala Dosa', price: 60, category: 'Traditional Breakfast', stallId: 'S1', stallName: 'Morning Star', active: true, description: 'Crispy rice crepe with potato filling' },
  { name: 'Idli Sambhar', price: 40, category: 'Traditional Breakfast', stallId: 'S1', stallName: 'Morning Star', active: true, description: 'Steamed rice cakes with lentil soup' },
  { name: 'Medu Vada', price: 45, category: 'Traditional Breakfast', stallId: 'S1', stallName: 'Morning Star', active: true, description: 'Deep fried savory lentil donuts' },
  { name: 'Paneer Paratha', price: 70, category: 'Traditional Breakfast', stallId: 'S1', stallName: 'Morning Star', active: true, description: 'Whole wheat flatbread stuffed with paneer' },
  
  // Chinese - The Green Kitchen
  { name: 'Veg Manchurian', price: 120, category: 'Indo-Chinese', stallId: 'S2', stallName: 'The Green Kitchen', active: true, description: 'Vegetable balls in spicy soy sauce' },
  { name: 'Gobi 65', price: 100, category: 'Indo-Chinese', stallId: 'S2', stallName: 'The Green Kitchen', active: true, description: 'Spicy deep fried cauliflower florets' },
  { name: 'Veg Fried Rice', price: 110, category: 'Indo-Chinese', stallId: 'S2', stallName: 'The Green Kitchen', active: true, description: 'Stir fried rice with fresh vegetables' },
  { name: 'Hakka Noodles', price: 110, category: 'Indo-Chinese', stallId: 'S2', stallName: 'The Green Kitchen', active: true, description: 'Street style vegetable noodles' },

  // Main Course - Spices of India
  { name: 'Paneer Butter Masala', price: 160, category: 'Main Course (Veg)', stallId: 'S3', stallName: 'Spices of India', active: true, description: 'Cottage cheese in creamy tomato gravy' },
  { name: 'Dal Makhani', price: 140, category: 'Main Course (Veg)', stallId: 'S3', stallName: 'Spices of India', active: true, description: 'Slow cooked black lentils with butter' },
  { name: 'Veg Kadai', price: 130, category: 'Main Course (Veg)', stallId: 'S3', stallName: 'Spices of India', active: true, description: 'Assorted vegetables in spicy kadai masala' },
  { name: 'Jeera Rice', price: 90, category: 'Main Course (Veg)', stallId: 'S3', stallName: 'Spices of India', active: true, description: 'Basmati rice tempered with cumin' },
  
  // Beverages - The Refreshery
  { name: 'Mango Lassi', price: 60, category: 'Sips & Shakes', stallId: 'S4', stallName: 'The Refreshery', active: true, description: 'Creamy yogurt based mango drink' },
  { name: 'Masala Chai', price: 20, category: 'Sips & Shakes', stallId: 'S4', stallName: 'The Refreshery', active: true, description: 'Traditional spiced Indian tea' },
  { name: 'Cold Coffee', price: 70, category: 'Sips & Shakes', stallId: 'S4', stallName: 'The Refreshery', active: true, description: 'Chilled coffee blended with ice cream' },
  { name: 'Fresh Lime Soda', price: 40, category: 'Sips & Shakes', stallId: 'S4', stallName: 'The Refreshery', active: true, description: 'Fizzy lemonade with sweet or salt' },

  // Desserts - The Refreshery
  { name: 'Gulab Jamun', price: 50, category: 'Indian Desserts', stallId: 'S4', stallName: 'The Refreshery', active: true, description: 'Milk solids balls in sugar syrup' },
  { name: 'Gajar Halwa', price: 60, category: 'Indian Desserts', stallId: 'S4', stallName: 'The Refreshery', active: true, description: 'Slow cooked carrot pudding' },
  { name: 'Kulfi', price: 45, category: 'Indian Desserts', stallId: 'S4', stallName: 'The Refreshery', active: true, description: 'Traditional Indian frozen dessert' },
  { name: 'Fruit Cream', price: 80, category: 'Indian Desserts', stallId: 'S4', stallName: 'The Refreshery', active: true, description: 'Fresh fruits mixed with sweetened cream' }
];

async function seed() {
  console.log('--- Starting Seeding ---');

  // Seed Categories (Base Items)
  console.log('Seeding Categories...');
  for (const cat of categories) {
    await db.collection('baseItems').add(cat);
  }

  // Seed Stalls
  console.log('Seeding Stalls...');
  for (const stall of stalls) {
    await db.collection('stalls').doc(stall.id).set(stall);
  }

  // Seed Products
  console.log('Seeding Products...');
  for (const prod of products) {
    await db.collection('products').add(prod);
  }

  console.log('--- Seeding Completed Successfully ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
