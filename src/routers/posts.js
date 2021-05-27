const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth')

const { db, admin } = require('../db/firebase')

router.post('/:username/posts', auth, async (req, res) => {
    try {
        const users = db.collection('posts').doc(req.params.username);
        const doc = await users.get();

        if (!doc.data()) {
            res.status(404).send("No user found")
        }

        const posts = doc.data();
        res.status(200).send(posts);
    } catch (e) {
        res.status(400).send();
    }
})


router.post('/compose', auth, (req, res) => {
    try {
        res.status(200).send(req.user.username);
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/composeposts', auth, async (req, res) => {
    try {
        const post = req.body.post;
        let time = Math.round(+new Date() / 1000);;
        let timeUser = time.toString();

        let nameId = timeUser + req.user.username

        await db.collection('posts').doc(req.user.username).update({
            [nameId]: {
                text: post,
                likes: 0,
                usersLiked: []
            }
        });

        res.status(200).send(req.user.username)
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
})

router.post('/like', auth, async (req, res) => {

    try {
        const users = db.collection('posts').doc(req.body.user);
        const doc = await users.get();


        const updateUserId = req.body.id;
        const textUser = doc.data()
        const text = textUser[updateUserId].text;
        let likes = textUser[updateUserId].likes;
        let usersLiked = textUser[updateUserId].usersLiked

        //Check if the user has already liked

        usersLiked.forEach(element => {
            if(element == req.user.username){
                console.log("ok");
                throw new Error("Already liked");
            }
        });

        //Store who liked
        usersLiked.push(req.user.username)
        likes = likes + 1

        //Insert in database
        await db.collection('posts').doc(req.body.user).update({
            [updateUserId]: {
                text: text,
                likes: likes,
                usersLiked: usersLiked
            }
        });
        res.status(200).send()
    } catch (e) {
        res.status(400).send(e)
    }

})

module.exports = router