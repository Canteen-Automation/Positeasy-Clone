const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function redistribute() {
  console.log('--- Starting Stall Redistribution ---');

  try {
    const stallsUpdate = [
      { id: '1', name: 'Bento Express', description: 'Quick Asian fusion meals and sides', emoji: '🍱', color: '#f0fdf4' },
      { id: '2', name: 'The Thali House', description: 'Traditional regional Indian platters', emoji: '🍱', color: '#fffbeb' },
      { id: 'S1', name: 'Morning Star', description: 'Freshly made breakfast and snacks', emoji: '☀️', color: '#fef3c7' },
      { id: 'S2', name: 'The Green Kitchen', description: 'Healthy and spicy vegetarian main course', emoji: '🥦', color: '#ecfdf5' },
      { id: 'S3', name: 'Spices of India', description: 'Authentic regional flavors and masalas', emoji: '🌶️', color: '#fff1f2' },
      { id: 'S4', name: 'The Refreshery', description: 'Chilled beverages and traditional desserts', emoji: '🥤', color: '#eff6ff' }
    ];

    const stallMap = {};
    for (const s of stallsUpdate) {
      await db.collection('stalls').doc(s.id).set(s, { merge: true });
      stallMap[s.id] = s.name;
    }

    const pSnap = await db.collection('products').get();
    const batch = db.batch();

    const products = [];
    pSnap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));

    // Mapping logic: 3-4 products per stall
    const newAssignments = [
      // Bento Express (1)
      { name: 'Veg Fried Rice', sid: '1' }, { name: 'Veg Manchurian', sid: '1' }, { name: 'Hakka Noodles', sid: '1' },
      // The Thali House (2)
      { name: 'Dal Makhani', sid: '2' }, { name: 'Veg Kadai', sid: '2' }, { name: 'Paneer Paratha', sid: '2' },
      // Morning Star (S1)
      { name: 'Masala Dosa', sid: 'S1' }, { name: 'Idli Sambhar', sid: 'S1' }, { name: 'Medu Vada', sid: 'S1' },
      // The Green Kitchen (S2)
      { name: 'Gobi 65', sid: 'S2' }, { name: 'Veg Thali', sid: 'S2' }, // I'll assume Veg Thali exists or add it
      // Spices of India (S3)
      { name: 'Paneer Butter Masala', sid: 'S3' }, { name: 'Jeera Rice', sid: 'S3' },
      // The Refreshery (S4) - Drinks & Desserts
      { name: 'Mango Lassi', sid: 'S4' }, { name: 'Masala Chai', sid: 'S4' }, { name: 'Cold Coffee', sid: 'S4' },
      { name: 'Fresh Lime Soda', sid: 'S4' }, { name: 'Gulab Jamun', sid: 'S4' }, { name: 'Gajar Halwa', sid: 'S4' },
      { name: 'Kulfi', sid: 'S4' }, { name: 'Fruit Cream', sid: 'S4' }
    ];

    for (const prod of products) {
      const assignment = newAssignments.find(a => a.name === prod.name);
      if (assignment) {
        batch.update(db.collection('products').doc(prod.id), {
          stallId: assignment.sid,
          stallName: stallMap[assignment.sid]
        });
      }
    }

    await batch.commit();
    console.log('--- Stall Redistribution Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('Redistribution failed:', error);
    process.exit(1);
  }
}

redistribute();
