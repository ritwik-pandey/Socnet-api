const express = require('express');
const router = new express.Router();
var firebase = require('firebase');
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const cookieParser = require("cookie-parser");
router.use(cookieParser());



const { db, admin } = require('../db/firebase')


router.post('/unfollow', auth, async (req, res) => {
    try {

        const userRef = db.collection('users').doc(req.body.username);
        const userRef1 = db.collection('users').doc(req.user.username);

        await userRef.update({
            followers: admin.firestore.FieldValue.arrayRemove(req.user.username)
        });

        await userRef1.update({
            following: admin.firestore.FieldValue.arrayRemove(req.body.username)
        });

        res.status(200).send();
    } catch (e) {
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
    } catch (e) {
        res.status(400).send();
    }

    // req.user - gives user who requested
    // req.body - for whom the button was clicked


})

router.post('/:username/followers', auth, async (req, res) => {
    try {
        const users = db.collection('users').doc(req.params.username);
        const doc = await users.get();

        if (!doc.data()) {
            res.status(404).send("No user found")
        }

        const followers = doc.data().followers;
        res.status(200).send(followers);
    } catch (e) {
        res.send("400").send();
    }
})

router.post('/:username/following', auth, async (req, res) => {
    try {
        const users = db.collection('users').doc(req.params.username);
        const doc = await users.get();

        if (!doc.data()) {
            res.status(404).send("No user found")
        }

        const following = doc.data().following;
        res.status(200).send(following);
    } catch (e) {
        res.send("400").send();
    }
})

router.post('/me', auth, async (req, res) => {
    try {
        res.status(200).send(req.user.username)
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/:username', auth, async (req, res) => {

    const users = db.collection('users').doc(req.params.username);
    const doc = await users.get();

    if (!doc.data()) {
        res.status(404).send("No user found")
    }

    const posts = db.collection('posts').doc(req.params.username);
    const doc1 = await posts.get();
    let postsNumber = 0;
    if(doc1.data() != null){
        postsNumber = Object.keys(doc1.data()).length;
    }

    const followers = doc.data().followers;
    let isFollowing = false;
    followers.forEach((element) => {
        if (req.user.username === element) {
            isFollowing = true
        }
    })


    res.status(200).send({
        user: doc.data(),
        posts: postsNumber,
        isFollowing: isFollowing
    })

})




module.exports = router