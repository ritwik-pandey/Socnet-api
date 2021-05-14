const express = require('express');
const router = new express.Router();

const { database } = require('firebase-admin');

// Connect to database
const admin = require('firebase-admin');

const serviceAccount = require('../socnet-api-296af-8b8d0a7ef564.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

//Connection ended

router.post('/users', async (req, res) => {
    try {
        const usersdata = db.collection('users').doc(req.body.username);
        const doc = await usersdata.get();
        if (!doc.exists) {
            const data = {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email,
                uniqueString: req.body.uniqueString,
                confirmed: false
            }
            const user = await db.collection('users').doc(req.body.username).set(data);
            res.status(200).send("Success");

        } else {
            res.status(400).send('Name is already taken!')
        }
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})


module.exports = router