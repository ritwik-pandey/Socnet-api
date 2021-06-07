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
                db.collection('users').doc(req.user.username).delete();
                db.collection('posts').doc(req.user.username).delete();
                db.collection('userLikesAndComments').doc(req.user.username).delete();
                res.status(200).send()  


            } else {
                res.status(400).send()
            }
        });


    } catch (error) {
        console.log(error);
        res.status(400).send();
    }
})

async function deleteAllActivity(user) {
    try {
        const usersRef = db.collection('users').doc(user);
        const doc = await usersRef.get();
        const following = doc.data().following;
        for (i in following) {
            await db.collection('users').doc(following[i]).update({
                followers: admin.firestore.FieldValue.arrayRemove(user)
            });
        }
        const followers = doc.data().followers;
        for (i in followers) {
            await db.collection('users').doc(followers[i]).update({
                following: admin.firestore.FieldValue.arrayRemove(user)
            });
        }
        let userLikedShareCommented = db.collection('userLikesAndComments').doc(user);
        let likesandcomments = await userLikedShareCommented.get();

        const likes = likesandcomments.data().likes;
        for (i in likes) {
            const likedUsername = likes[i];
            const postId = i;
            await deleteLike(likedUsername, postId, user);
        }

        const comments = likesandcomments.data().comments;
        for (i in comments) {
            const commentedUsername = comments[i];
            const commentId = i;
            await deleteComments(commentedUsername, commentId, user);
        }

        const shares = likesandcomments.data().shares;
        for (i in shares) {
            const sharedUsername = shares[i];
            const sharedId = i;
            await deleteShares(sharedUsername, sharedId);
        }
    } catch (e) {
        console.log(e);
    }

}

//Delete likes of user 

async function deleteLike(likedUsername, postId, user) {
    try {
        const postsRef = db.collection('posts').doc(likedUsername);
        const doc =  await postsRef.get();
        const postUser = doc.data()

        if(postUser === undefined){
            return;
        }


        const updateUserId = postId;
        const text = postUser[updateUserId].text;
        let likes = postUser[updateUserId].likes;
        let usersLiked = postUser[updateUserId].usersLiked;
        let comments = postUser[updateUserId].comments;
        let usersComments = postUser[updateUserId].usersComments;
        let shared = postUser[updateUserId].shared
        let sharedId = postUser[updateUserId].sharedId;

        if (shared === undefined) {
            shared = ""
            sharedId = ""
        }

        likes = likes - 1;

        usersLiked.pop(user);

        await db.collection('posts').doc(likedUsername).update({
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
        
    } catch (e) {
        console.log(e);
    }

}

//Delete comment of user

async function deleteComments(commentedUsername, commentId, user) {
    try {
        const postsRef1 = db.collection('posts').doc(commentedUsername);
        const doc1 =  await postsRef1.get();
        const postUser = doc1.data();
        
        if(postUser === undefined){
            return;
        }

        const updateUserId = commentId;
        const text = postUser[updateUserId].text;
        let likes = postUser[updateUserId].likes;
        let usersLiked = postUser[updateUserId].usersLiked;
        let comments = postUser[updateUserId].comments;
        let usersComments = postUser[updateUserId].usersComments;
        let shared = postUser[updateUserId].shared
        let sharedId = postUser[updateUserId].sharedId;

        if (shared === undefined) {
            shared = ""
            sharedId = ""
        }

        comments = comments - 1;

        delete usersComments[user];
        await db.collection('posts').doc(commentedUsername).update({
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
    } catch (e) {
        console.log(e);
    }

}

//delete shares of user

async function deleteShares(sharedUsername, userSharedId) {

    const FieldValue = admin.firestore.FieldValue;


    const postsRef = db.collection('posts').doc(sharedUsername);

    if(sharedUsername[userSharedId] === undefined){
        return;
    }


    await postsRef.update({
        [userSharedId]: FieldValue.delete()
    });
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