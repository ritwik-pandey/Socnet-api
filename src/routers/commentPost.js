const express = require('express');
const router = new express.Router();

const auth = require('../middleware/auth')
const { db, admin } = require('../db/firebase')

router.post('/comment', auth, async (req, res) => {
    try {
        const users = db.collection('posts').doc(req.body.user);
        const doc = await users.get();

        const posts = doc.data()

        const updateUserId = req.body.id;

        const text = posts[updateUserId].text;
        let likes = posts[updateUserId].likes;
        let usersLiked = posts[updateUserId].usersLiked;
        let comments = posts[updateUserId].comments;
        comments = comments + 1;
        let usersComments = posts[updateUserId].usersComments;

        let oldComments = usersComments[req.user.username];


        // usersComments[req.user.username] = 

        if(oldComments === undefined){
            oldComments = []
        }

        oldComments.push(req.body.comment)
        usersComments[req.user.username] = oldComments

        await db.collection('posts').doc(req.body.user).update({
            [updateUserId]: {
                text: text,
                likes: likes,
                usersLiked: usersLiked,
                comments: comments,
                usersComments: usersComments
            }
        });

        res.status(200).send()
    } catch (e) {
        console.log(e);
        res.status(400).send()
    }
})


module.exports = router;