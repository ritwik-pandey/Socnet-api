const express = require('express');
const router = new express.Router();
var firebase = require('firebase');
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const cookieParser = require("cookie-parser");
router.use(cookieParser());



const { db, admin } = require('../db/firebase')


router.post('/unfollow' , auth , async (req , res) => {
    try{

        console.log("I cma");

        const userRef = db.collection('users').doc(req.body.username);
        const userRef1 = db.collection('users').doc(req.user.username);

        await userRef.update({
            followers: admin.firestore.FieldValue.arrayRemove(req.user.username)
        });

        await userRef1.update({
            following: admin.firestore.FieldValue.arrayRemove(req.body.username)
        });

        res.status(200).send();
    }catch(e){
        res.status(400).send(e)
    }
})


router.post('/follow', auth, async (req, res) => {

    try {

        const userRef = db.collection('users').doc(req.body.username);
        const userRef1 = db.collection('users').doc(req.user.username);
        // Atomically add a new user to the followers array field.
        //Add follow for whom button was clicked
        await userRef.update({
            followers: admin.firestore.FieldValue.arrayUnion(req.user.username)
        });

        //Add following from whom button was clicked

        await userRef1.update({
            following: admin.firestore.FieldValue.arrayUnion(req.body.username)
        });

        res.status(200).send()
    }catch(e){
        res.status(400).send();
    }

    // req.user - gives user who requested
    // req.body - for whom the button was clicked


})

router.post('/:username', auth, async (req, res) => {

    const users = db.collection('users').doc(req.params.username);
    const doc = await users.get();
    
    const followers = doc.data().followers;
    let isFollowing = false;
    followers.forEach((element) => {
        if(req.user.username === element) {
            isFollowing = true
        }
    })

    if (!doc.data()) {
        res.status(404).send("No user found")
    } else {
        res.status(200).send({
            user: doc.data(),
            isFollowing: isFollowing
        })
    }
})




module.exports = router