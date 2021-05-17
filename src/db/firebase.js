const { database } = require('firebase-admin');

// Connect to database
const admin = require('firebase-admin');

const serviceAccount = require('../socnet-api-296af-8b8d0a7ef564.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // serviceAccountId: 'socnet-api@socnet-api-296af.iam.gserviceaccount.com'

});
const db = admin.firestore();

module.exports = { db, admin };

//Connection ended