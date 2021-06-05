const express = require('express');
const router = new express.Router();
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')
const { db, admin } = require('../db/firebase')

router.post('/settings', auth, (req, res) => {
    try {
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/changeusername', auth, (req, res) => {
    try {
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/changeusernamefinal', auth, async (req, res) => {
    try {
        const newname = req.body.newusername
        const users = db.collection('users');
        const query = await users.where('username', '==', newname).get();
        if (query.empty) {

            const oldusername = db.collection('users').doc(req.user.username);
            const doc = await oldusername.get();
            const data = {
                username: newname,
                password: doc.data().password,
                email: doc.data().email,
                confirmed: doc.data().confirmed,
                token: doc.data().token,
                following: doc.data().following,
                followers: doc.data().followers
            }
            
            await db.collection('users').doc(newname).set(data);
            
            const oldusername1 = db.collection('posts').doc(req.user.username);
            const doc1 = await oldusername1.get();
            console.log(doc1.data());
            

            const post = await db.collection('posts').doc(newname).set(doc1.data());

            await db.collection('users').doc(req.user.username).delete();
            await db.collection('posts').doc(req.user.username).delete();

            res.status(200).send();
        } else {
            res.status(400).send()
        }

    } catch (error) {
        console.log(error);
    }
})

module.exports = router