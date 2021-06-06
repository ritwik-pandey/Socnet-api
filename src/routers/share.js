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

        const users1 = db.collection('posts').doc(req.user.username);
        const doc1 = await users1.get();

        let postData = doc1.data();

        for(i in doc1.data()){
            if(postData[i].sharedId === req.body.id){
                throw new Error();
            }
        }

        var today = new Date();
        let month = (today.getMonth() + 1);
        month = (month < 10 ? '0' : '') + month;
        var time = today.getFullYear() + "" + month + "" + today.getDate() + "" + today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();
        let timeUser = time.toString();
        let nameId = timeUser + req.user.username

        const updateUserId = req.body.id;
        const textUser = doc.data()
        const text = textUser[updateUserId].text;
        let likes = 0;
        let usersLiked = [];
        let comments = 0;
        let usersComments = {};

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

        const myShare = 'shares.' + nameId;

        db.collection('userLikesAndComments').doc(req.user.username).update({
            [myShare]: '' + req.body.username + ''
        })
        res.status(200).send()
    } catch (e) {
        console.log(e);
        res.status(400).send()
    }

})


module.exports = router