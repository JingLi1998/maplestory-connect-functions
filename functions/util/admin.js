const admin = require('firebase-admin');

let serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://maplestory-connect.firebaseio.com',
  storageBucket: 'gs://maplestory-connect.appspot.com/'
});

const db = admin.firestore();

module.exports = { admin, db };
