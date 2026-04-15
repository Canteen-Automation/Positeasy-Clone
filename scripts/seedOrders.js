const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedOrders() {
  console.log('--- Starting Order Seeding ---');

  try {
    // 1. Fetch available products and stalls for realistic data
    const productsSnap = await db.collection('products').get();
    const products = [];
    productsSnap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));

    if (products.length === 0) {
      console.error('No products found. Please seed products first.');
      process.exit(1);
    }

    const statuses = ['COMPLETED', 'PAID', 'CANCELLED'];
    const paymentMethods = ['UPI - GPay', 'UPI - PhonePe', 'Cash', 'Card'];

    const createOrder = (date) => {
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalAmount = 0;

      for (let i = 0; i < numItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        orderItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: qty,
          stallId: product.stallId,
          stallName: product.stallName
        });
        totalAmount += product.price * qty;
      }

      const orderId = Date.now() + Math.floor(Math.random() * 1000);
      return {
        orderNumber: `ORD-${orderId}`,
        displayOrderId: orderId.toString().slice(-6),
        userId: 'system-seed',
        user: {
          name: 'Demo Customer',
          mobileNumber: '9876543210'
        },
        totalAmount: totalAmount,
        status: statuses[Math.floor(Math.random() * (statuses.length - 0.5))], // Favor COMPLETED/PAID
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        createdAt: admin.firestore.Timestamp.fromDate(date),
        items: orderItems,
        archived: date < new Date(new Date().setHours(0,0,0,0)) // Mark as archived if before today
      };
    };

    const batch = db.batch();

    // 2. Generate 10 orders for Today
    console.log('Generating 10 orders for Today...');
    for (let i = 0; i < 10; i++) {
      const today = new Date();
      today.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60)); // Random time between 8am and 8pm
      const orderRef = db.collection('orders').doc();
      batch.set(orderRef, createOrder(today));
    }

    // 3. Generate 20 orders for the last 10 days
    console.log('Generating 20 historical orders (last 10 days)...');
    for (let day = 1; day <= 10; day++) {
      for (let orderPerDay = 0; orderPerDay < 2; orderPerDay++) {
        const histDate = new Date();
        histDate.setDate(histDate.getDate() - day);
        histDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
        const orderRef = db.collection('orders').doc();
        batch.set(orderRef, createOrder(histDate));
      }
    }

    await batch.commit();
    console.log('--- Order Seeding Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedOrders();
