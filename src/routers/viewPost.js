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
        // console.log([updateUserId]);

        const text = posts[updateUserId].text;
        let likes = posts[updateUserId].likes;
        let usersLiked = posts[updateUserId].usersLiked;
        let comments = posts[updateUserId].comments;
        comments = comments + 1;
        let usersComments = posts[updateUserId].usersComments;
        let shared = posts[updateUserId].shared
        let sharedId = posts[updateUserId].sharedId
        if(shared === undefined){
            shared = ""
            sharedId = ""
        }

        let oldComments = usersComments[req.user.username];


        // usersComments[req.user.username] = 

        if (oldComments === undefined) {
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
                usersComments: usersComments,
                shared: shared,
                sharedId: sharedId
            }
        });

        const myComments = 'comments.' + updateUserId;

        db.collection('userLikesAndComments').doc(req.user.username).update({
            [myComments]: req.body.user
        })

        res.status(200).send()
    } catch (e) {
        console.log(e);
        res.status(400).send()
    }
})

router.post('/seelikesandcomments', auth, async (req, res) => {
    try {
        const users = db.collection('posts').doc(req.body.user);
        const doc = await users.get();

        const data = doc.data();

        const id = req.body.id;
        const details = data[id];

        let userLiked = false;
        let likes = data[id].usersLiked;

        //Check if user has liked the post

        for(let i = 0 ; i < likes.length ; ++i){
            if(likes[i] === req.user.username){
                userLiked = true;
                break;
            }
        }


        res.status(200).send({
            details: details,
            id: id,
            isLiked: userLiked
        })
    }catch(e){
        console.log(e);
        res.status(400).send()
    }
    
})


module.exports = router;