const express = require('express');
const router = new express.Router();
var firebase = require('firebase');
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')

const { db, admin } = require('../db/firebase')

router.post('/share', auth, async (req, res) => {
    try {
        const users = db.collection('posts').doc(req.body.username);
        const doc = await users.get();

        var today = new Date();
        let month = (today.getMonth() + 1);
        month = (month < 10 ? '0' : '') + month;
        var time = today.getFullYear() + "" + month + "" + today.getDate() + "" + today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();
        let timeUser = time.toString();
        let nameId = timeUser + req.user.username

        const updateUserId = req.body.id;
        const textUser = doc.data()
        const text = textUser[updateUserId].text;
        let likes = textUser[updateUserId].likes;
        let usersLiked = textUser[updateUserId].usersLiked;
        let comments = textUser[updateUserId].comments;
        let usersComments = textUser[updateUserId].usersComments;

        await db.collection('posts').doc(req.user.username).update({
            [nameId]: {
                text: text,
                likes: likes,
                usersLiked: usersLiked,
                comments: comments,
                usersComments: usersComments,
                shared: req.body.username,
                sharedId: updateUserId
            }
        });
        res.status(200).send()
    } catch (e) {
        console.log(e);
        res.status(400).send()
    }

})


module.exports = router