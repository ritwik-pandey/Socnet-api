const express = require('express');
const router = new express.Router();
const bcrypt = require('bcrypt')
const saltRounds = 10;
var firebase = require('firebase');
const jwt = require('jsonwebtoken')



const { db, admin } = require('../db/firebase')

checkEmail = async (email, _callback) => {
    const users = db.collection('users');
    const snapshot = await users.where('confirmed', '==', true).get();
    let flag = true;
    if (snapshot.empty) {
        _callback(flag);
    }

    let count = 0;
    snapshot.forEach(doc => {
        bcrypt.compare(email, doc.data().email).then(function (result) {

            //All conditions are true
            if (result === true) {
                flag = false;
            }
            count++;
            if (count === snapshot.size) {
                _callback(flag);
            }
        })
    })

}


// Register user
router.post('/users', async (req, res) => {
    try {
        checkEmail(req.body.email, async (response) => {
            if (response === false) {
                res.status(400).send('Email already taken')
            } else {
                const usersdata = db.collection('users').doc(req.body.username);
                const doc = await usersdata.get();
                const emailhash = bcrypt.hashSync(req.body.email, saltRounds);

                //Create document
                if (!doc.exists) {
                    const data = {
                        username: req.body.username,
                        password: req.body.password,
                        email: emailhash,
                        uniqueString: req.body.uniqueString,
                        confirmed: false,
                        token: "",
                        following: [],
                        followers: []
                    }
                    const user = await db.collection('users').doc(req.body.username).set(data);

                    const postData = {

                    }

                    const userLikesAndCommentsData = {

                    }

                    const notifications = {
                        notifications: [],
                        username: req.body.username
                    }

                    await db.collection('userLikesAndComments').doc(req.body.username).set(userLikesAndCommentsData);

                    await db.collection('posts').doc(req.body.username).set(postData);
                    await db.collection('notifications').doc(req.body.username).set(notifications);
                    res.status(200).send("Success");

                } else {
                    res.status(400).send('Name is already taken!')
                }
            }
        })




    } catch (e) {
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

router.post('/login', async (req, res) => {
    try {
        const username = req.body.username
        const password = req.body.password

        const users = db.collection('users');
        const snapshot = await users.where('username', '==', username).get();
        if (snapshot.empty) {
            res.status(404).send("Not found user");
        }


        snapshot.forEach(doc => {
            bcrypt.compare(password, doc.data().password, function (err, result) {
                if (err) {
                    res.status(400).send();
                } else if (result == true && doc.data().confirmed == true) {
                    //jwt
                    const token = jwt.sign({ username: doc.data().username }, process.env.SECRET)
                    db.collection('users').doc(doc.data().username).set({
                        token: token
                    }, { merge: true });

                    res.status(200).send(token)

                } else {
                    res.status(400).send("Wrong password");
                }
            });
        });

    } catch (e) {
        res.status(400).send(e);
    }
})



module.exports = router