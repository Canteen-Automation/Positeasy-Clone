const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function migrate() {
  console.log('--- Starting Migration ---');

  // 1. Migrate Stalls
  try {
    const stallsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../ordering_site/stalls_response.json'), 'utf8'));
    console.log(`Found ${stallsData.length} stalls. Migrating...`);
    const stallBatch = db.batch();
    stallsData.forEach(stall => {
      const stallRef = db.collection('stalls').doc(stall.id.toString());
      // Firestore limit is ~1MB. Byte length of base64 string is roughly 4/3 of data.
      if (stall.imageData && stall.imageData.length > 800000) {
        console.warn(`Stall ${stall.id} image too large, omitting.`);
        delete stall.imageData;
      }
      stallBatch.set(stallRef, stall);
    });
    await stallBatch.commit();
    console.log('Stalls migrated successfully.');
  } catch (err) {
    console.error('Error migrating stalls:', err.message);
  }

  // 2. Migrate Products
  try {
    const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../ordering_site/products_response.json'), 'utf8'));
    console.log(`Found ${productsData.length} products. Migrating...`);
    
    // Firestore batch limit is 500. Using many batches if needed.
    const productChunks = [];
    for (let i = 0; i < productsData.length; i += 500) {
        productChunks.push(productsData.slice(i, i + 500));
    }

    for (const chunk of productChunks) {
        const productBatch = db.batch();
        chunk.forEach(product => {
            const productRef = db.collection('products').doc(product.id.toString());
            if (product.imageData && product.imageData.length > 800000) {
              console.warn(`Product ${product.id} image too large, omitting.`);
              delete product.imageData;
            }
            productBatch.set(productRef, product);
        });
        await productBatch.commit();
    }
    console.log('Products migrated successfully.');
  } catch (err) {
    console.error('Error migrating products:', err.message);
  }

  // 3. Create Default Admin User
  try {
    const adminEmail = 'admin@positeasy.com';
    const adminPassword = 'admin123'; // Min 6 chars
    
    let userRecord;
    try {
        userRecord = await auth.getUserByEmail(adminEmail);
        console.log(`Admin user ${adminEmail} already exists.`);
    } catch (e) {
        userRecord = await auth.createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: 'Master Admin'
        });
        console.log(`Created admin user: ${userRecord.uid}`);
    }

    // Add to users collection with role
    await db.collection('users').doc(userRecord.uid).set({
        name: 'Master Admin',
        email: adminEmail,
        role: 'master',
        permissions: ['ALL'],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('Admin metadata saved to Firestore.');

  } catch (err) {
    console.error('Error creating admin user:', err.message);
  }

  console.log('--- Migration Completed ---');
  process.exit();
}

migrate();

