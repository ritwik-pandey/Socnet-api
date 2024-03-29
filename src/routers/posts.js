const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth')



const { db, admin } = require('../db/firebase')

router.post('/:username/posts', auth, async (req, res) => {
    try {
        const users = db.collection('posts').doc(req.params.username);
        const doc = await users.get();

        if (!doc.data()) {
            throw new Error('No user found')
        }

        const posts = doc.data();
        for (i in posts) {
            posts[i].text = posts[i].text.substring(0 , 20);
            posts[i].text = posts[i].text + " ..."
            let usersLiked = posts[i].usersLiked;

            posts[i].isLiked = false;
            if (req.user.username === req.params.username) {
                posts[i].ismyprofile = "yes";
            } else {
                posts[i].ismyprofile = "no";
            }

            for (let j = 0; j < usersLiked.length; ++j) {
                if (usersLiked[j] == req.user.username) {
                    posts[i].isLiked = true;
                    break;
                }
            }
        }

        //--------------------------Sort the object before sending---------------------

        let keys = [];
        let sortedObj = {};
        // Put keys in Array
        for (i in posts) {
            let index = i.length - req.body.user.length
            i = i.substring(0, index)
            let no = parseInt(i, 10)
            keys.push(no);
        }
        keys.sort().reverse();
        for (let i = 0; i < keys.length; ++i) {
            let id = keys[i];
            let idString = '' + id + req.body.user;
            sortedObj[idString] = posts[idString]
        }
        res.status(200).send(sortedObj);
    } catch (e) {
        if (e === 'No user found') {
            res.status(404).send()
        } else {
            res.status(400).send();
        }
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
        //Get time for id 
        var today = new Date();
        let month = (today.getMonth() + 1);
        month = (month < 10 ? '0' : '') + month;
        var time = today.getFullYear() + "" + month + "" + today.getDate() + "" + today.getHours() + "" + today.getMinutes() + "" + today.getSeconds();
        let timeUser = time.toString();

        let post = req.body.post;
        let nameId = timeUser + req.user.username

        post = post.substring(0 , 240);

        await db.collection('posts').doc(req.user.username).update({
            [nameId]: {
                text: post,
                likes: 0,
                comments: 0,
                usersComments: {

                },
                usersLiked: [],
                shared: "",
                sharedId: "",
                usersWhoShared: {

                }
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
        let usersLiked = textUser[updateUserId].usersLiked;
        let comments = textUser[updateUserId].comments;
        let usersComments = textUser[updateUserId].usersComments;
        let shared = textUser[updateUserId].shared
        let sharedId = textUser[updateUserId].sharedId
        let usersWhoShared = textUser[updateUserId].usersWhoShared
        if (shared === undefined) {
            shared = ""
            sharedId = ""
        }

        //Check if the user has already liked

        usersLiked.forEach(element => {
            if (element == req.user.username) {
                alreadyLiked(likes, usersLiked, text, req.user.username, req.body.user, updateUserId, comments, usersComments, shared, sharedId , usersWhoShared);
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
                usersLiked: usersLiked,
                comments: comments,
                usersComments: usersComments,
                shared: shared,
                sharedId: sharedId,
                usersWhoShared: usersWhoShared
            }
        });

        const myLikes = 'likes.' + updateUserId;

        const usersLikes = db.collection('userLikesAndComments').doc(req.user.username).update({
            [myLikes]: '' + req.body.user + ''
        })


        //Insert notification of likes
        const notifications = db.collection('notifications').doc(req.body.user);
        let onClickText = "showPostNotification('" + req.body.user + "' , '" + updateUserId + "')"
        let notificationText = '<a class="notification-link" href="/' + req.user.username + '"> ' + req.user.username + '</a> <p onClick="' + onClickText + '" class="notification-paragraph" id="' + updateUserId + '">liked your post</p>'
        await notifications.update({
            notifications: admin.firestore.FieldValue.arrayUnion(notificationText)
        });

        res.status(200).send()
    } catch (e) {
        console.log(e);
        if (e === "Already liked") {
            res.status(200).send()
        } else {
            res.status(400).send(e)
        }
    }

})

function alreadyLiked(likes, usersLiked, text, username, userWhosePostWasLiked, idOfUser, comments, usersComments, shared, sharedId, usersWhoShared) {
    const FieldValue = admin.firestore.FieldValue;


    const userLikesAndComments = db.collection('userLikesAndComments').doc(username);

    const myLikes = 'likes.' + idOfUser;
    userLikesAndComments.update({
        [myLikes]: FieldValue.delete()
    });
    usersLiked.pop(username)
    likes = likes - 1
    db.collection('posts').doc(userWhosePostWasLiked).update({
        [idOfUser]: {
            text: text,
            likes: likes,
            usersLiked: usersLiked,
            comments: comments,
            usersComments: usersComments,
            shared: shared,
            sharedId: sharedId,
            usersWhoShared: usersWhoShared
        }
    });

    //Remove notification

    const notifications = db.collection('notifications').doc(userWhosePostWasLiked);
    let onClickText = "showPostNotification('" + userWhosePostWasLiked + "' , '" + idOfUser + "')"
    let notificationText = '<a class="notification-link" href="/' + username + '"> ' + username + '</a> <p onClick="' + onClickText + '" class="notification-paragraph" id="' + idOfUser + '">liked your post</p>'
    notifications.update({
        notifications: admin.firestore.FieldValue.arrayRemove(notificationText)
    });
}

module.exports = router