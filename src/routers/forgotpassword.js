const express = require('express');
const router = new express.Router();
const bcrypt = require('bcrypt')
const { db, admin } = require('../db/firebase')


router.post('/forgotpassword', async (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const uniqueString = req.body.uniqueString
    try {
        //Get user with username
        const usersdata = db.collection('users').doc(req.body.username);
        const doc = await usersdata.get();
        //Check the conditions
        if (doc && doc.data().confirmed != false) {
            bcrypt.compare(email, doc.data().email).then(function (result) {

                //All conditions are true
                if (result == true) {
                    const res1 = usersdata.set({
                        uniqueString: uniqueString
                    }, { merge: true });
                    res.status(200).send()
                } else {
                    res.status(400).send("Email not valid");
                }
            });
        } else {
            res.status(400).send("Username not found");
        }
    } catch (e) {
        res.status(400).send(e);
    }
})

router.post('/forgotpassword2', async (req, res) => {
    const uniqueString = req.body.uniqueString
    const password = req.body.password
    try {
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

            db.collection('users').doc(doc.data().username).set({
                password: password
            }, { merge: true });

        });
        res.status(200).send();
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
})


module.exports = router