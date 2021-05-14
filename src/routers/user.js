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


// Register user
router.post('/users', async (req, res) => {
    try {
        const usersdata = db.collection('users').doc(req.body.username);
        const doc = await usersdata.get();
        
        //Create document
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

//Verify user
router.post('/verify', async (req, res) => {
    try {
        const uniqueString = req.body.uniqueString;
        const users = db.collection('users');
        const snapshot = await users.where('uniqueString', '==', uniqueString).get();
        if (snapshot.empty) {
            res.status(404).send();
        }

        snapshot.forEach(doc => {
            const FieldValue = admin.firestore.FieldValue;

            // Create a document reference
            const user = db.collection('users').doc(doc.data().username);

            // Remove the 'uniqueString' field from the document
            const res = user.update({
                uniqueString: FieldValue.delete()
            });

            //Update user confirmed: true
            db.collection('users').doc(doc.data().username).set({
                confirmed: true
            }, { merge: true });
        });
        res.status(200).send();

    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})

//Log in

router.post('/login' , async (req , res) => {
    try{
        const email = req.body.email
        const password = req.body.password

        const users = db.collection('users');
        const snapshot = await users.where('email', '==', email).get();
        if (snapshot.empty) {
            res.status(404).send("Not found user");
        }

        snapshot.forEach(doc => {
            if(doc.data().password == password && doc.data().confirmed == true){
                res.status(200).send("Access granted!");
            }else{
                res.status(400).send("Wrong password");
            }
        });

    }catch(e){
        res.status(400).send(e);
    }
})


module.exports = router