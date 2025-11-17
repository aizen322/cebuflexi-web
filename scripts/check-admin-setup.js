// Quick script to check admin setup
// Run with: node scripts/check-admin-setup.js

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function checkAdminSetup(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log('\n✅ User found:', user.email);
    console.log('   UID:', user.uid);
    console.log('   Custom Claims:', user.customClaims || 'None');
    
    if (user.customClaims?.role === 'admin') {
      console.log('   ✅ Admin role is set!');
    } else {
      console.log('   ❌ Admin role is NOT set');
      console.log('   Setting admin role...');
      await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
      console.log('   ✅ Admin role set! User needs to sign out and back in.');
    }

    // Check Firestore user document
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (userDoc.exists) {
      const data = userDoc.data();
      console.log('\n✅ Firestore user document exists');
      console.log('   Role in Firestore:', data.role || 'Not set');
      
      if (data.role !== 'admin') {
        console.log('   Updating Firestore role to admin...');
        await userDoc.ref.update({ role: 'admin' });
        console.log('   ✅ Firestore role updated!');
      }
    } else {
      console.log('\n⚠️  Firestore user document does not exist');
      console.log('   Creating user document...');
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Admin',
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('   ✅ User document created!');
    }

    console.log('\n✅ Setup complete! User should sign out and sign back in.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'auth/user-not-found') {
      console.error('   User not found. Please create the account first.');
    }
  }
}

// Get email from command line
const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/check-admin-setup.js <email>');
  process.exit(1);
}

checkAdminSetup(email).then(() => process.exit(0));

