const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth')

const { db, admin } = require('../db/firebase')

router.post('/:username/posts' ,auth ,async (req , res) => {
    try{
        const users = db.collection('posts').doc(req.params.username);
        const doc = await users.get();

        if (!doc.data()) {
            res.status(404).send("No user found")
        }

        const posts = doc.data().posts;
        res.status(200).send(posts);
    }catch(e){
        res.status(400).send();
    }
})


router.post('/compose' , auth , (req ,res) => {
    try{
        res.status(200).send(req.user.username);
    }catch(e){
        res.status(400).send()
    }
})

router.post('/composeposts' , auth , async (req, res) => {
    try{
        const post = req.body.post;
        const userRef = db.collection('posts').doc(req.user.username);

        posts = {
            likes: 0,
            text: post
        }

        await userRef.update({
            posts: admin.firestore.FieldValue.arrayUnion(posts)
        });

        res.status(200).send(req.user.username)
    }catch(e){
        res.status(400).send();
    }
})

module.exports = router