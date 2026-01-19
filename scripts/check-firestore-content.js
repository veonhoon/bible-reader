#!/usr/bin/env node
/**
 * Script to check if there's published content in Firestore
 * Run with: node scripts/check-firestore-content.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyCvrU2KIlyxTJqu_fCc2pewmA2xHWF3x0g',
  authDomain: 'bibt-49dc8.firebaseapp.com',
  projectId: 'bibt-49dc8',
  storageBucket: 'bibt-49dc8.firebasestorage.app',
  messagingSenderId: '258900602870',
  appId: '1:258900602870:web:f2c1b39822d4e873a661d7',
};

async function checkContent() {
  console.log('🔍 Checking Firestore for published content...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Query weeklyContent collection
    const q = query(
      collection(db, 'weeklyContent'),
      orderBy('publishedAt', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('❌ No content found in Firestore!');
      console.log('\n📝 To fix this:');
      console.log('1. Go to https://bibt-49dc8.web.app/');
      console.log('2. Navigate to "Process Doc"');
      console.log('3. Upload and process a document');
      console.log('4. Click "Publish" to save it to Firestore\n');
      return;
    }

    console.log(`✅ Found ${snapshot.docs.length} published content item(s):\n`);

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Week ID: ${doc.id}`);
      console.log(`   Title: ${data.weekTitle || 'Untitled'}`);
      console.log(`   Snippets: ${data.snippets?.length || 0}`);
      console.log(`   Published: ${data.publishedAt?.toDate?.()?.toLocaleString() || 'Unknown'}`);

      // Show first few snippet IDs
      if (data.snippets && data.snippets.length > 0) {
        const snippetIds = data.snippets.slice(0, 3).map(s => s.id).join(', ');
        console.log(`   First snippet IDs: ${snippetIds}${data.snippets.length > 3 ? '...' : ''}`);
      }
      console.log('');
    });

    console.log('✨ Content is available in Firestore!');
    console.log('   If the mobile app still shows "No content", check the app logs.\n');

  } catch (error) {
    console.error('❌ Error checking Firestore:', error.message);
    if (error.code === 'permission-denied') {
      console.log('\n⚠️  Permission denied. This might be a Firestore rules issue.');
      console.log('   Check that weeklyContent allows read: if true\n');
    }
  }
}

checkContent().catch(console.error);
