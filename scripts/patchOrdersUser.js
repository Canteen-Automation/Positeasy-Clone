const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function patchOrders() {
  console.log('--- Starting Order User Patching ---');

  try {
    const targetUserId = '7ZzrexdM4YTqjFcM03ipIyxEDqR2'; // John Doe
    const targetUserName = 'John Doe';
    const targetUserMobile = '9876543210';

    const oSnap = await db.collection('orders').where('userId', '==', 'system-seed').get();
    
    if (oSnap.empty) {
      console.log('No system-seed orders found to patch.');
      process.exit(0);
    }

    const batch = db.batch();
    console.log(`Patching ${oSnap.size} orders to user ${targetUserName}...`);

    oSnap.forEach((doc) => {
      batch.update(doc.ref, {
        userId: targetUserId,
        user: {
          name: targetUserName,
          mobileNumber: targetUserMobile
        }
      });
    });

    await batch.commit();
    console.log('--- Order User Patching Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('Patching failed:', error);
    process.exit(1);
  }
}

patchOrders();
