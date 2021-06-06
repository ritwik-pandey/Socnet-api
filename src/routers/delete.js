const express = require('express');
const router = new express.Router();
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')
const { db, admin } = require('../db/firebase')

router.post('/deleteProfile', auth, (req, res) => {
    try {
        res.status(200).send(req.user.username)
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/deleteProfileFinal', auth, async (req, res) => {
    try {
        bcrypt.compare(req.body.input, req.user.password, function (err, result) {
            if (err) {
                res.status(400).send()
            } else if (result == true && req.user.confirmed == true) {
                deleteAllActivity(req.user.username)
                // db.collection('users').doc(req.user.username).delete();
                // db.collection('posts').doc(req.user.username).delete();
                // res.status(200).send()  


            } else {
                res.status(400).send()
            }
        });


    } catch (error) {
        res.status(400).send();
    }
})

async function deleteAllActivity(user) {
    const usersRef = db.collection('users').doc(user);
    const doc = await usersRef.get();
    const following = doc.data().following;
    for(i in following){
        await db.collection('users').doc(following[i]).update({
            followers: admin.firestore.FieldValue.arrayRemove(user)
        });
    }
    const followers = doc.data().followers;
    for(i in followers){
        await db.collection('users').doc(followers[i]).update({
            following: admin.firestore.FieldValue.arrayRemove(user)
        });
    }
    const userLikedShareCommented = db.collection('userLikesAndComments').doc(user);
    const likesandcomments = await userLikedShareCommented.get();

    const likes = likesandcomments.data().likes;
    for(i in likes){
        let path = i + '.usersLiked'; 
        console.log(likes[i]);
        await db.collection('posts').doc(likes[i]).update({
            [i]: admin.firestore.FieldValue.arrayRemove(user)
        } ,{merge: true});
    }

}

router.post('/deletepost', auth, async (req, res) => {
    try {
        const FieldValue = admin.firestore.FieldValue;

        const postsRef = db.collection('posts').doc(req.body.user);
        const posttodelete = req.body.id;

        await postsRef.update({
            [posttodelete]: FieldValue.delete()
        });

        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
})

module.exports = router