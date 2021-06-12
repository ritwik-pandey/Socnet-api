const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth')


const { db, admin } = require('../db/firebase')

router.post('/', auth, async (req, res) => {
    try {
        const users = db.collection('users').doc(req.user.username);
        const doc = await users.get();

        let postsSaved = {}
        let following = doc.data().following
        for (let i = 0; i < following.length; ++i) {
            let posts = db.collection('posts').doc(following[i]);
            let doc1 = await posts.get();
            let data = doc1.data();
            for(j in data){
                data[j].text = data[j].text.substring(0 , 20);
                data[j].text = data[j].text + ' ...'
                let isLiked = false;
                for(let l = 0 ; l < data[j].usersLiked.length ; ++l){
                    if(data[j].usersLiked[l] === req.user.username){
                        isLiked = true;
                        break;
                    }
                }
                postsSaved[j] = {
                    data: data[j],
                    user: following[i],
                    isLiked: isLiked
                }
            }
        }
        //--------------------------Sort the object before sending---------------------

        let keys = [];
        let sortedObj = {};
        let username = {}
        // Put keys in Array
        for (i in postsSaved) {
            let index = i.length - postsSaved[i].user.length
            j = i.substring(0, index)
            let no = parseInt(j, 10)
            keys.push(no);
            username[no] = postsSaved[i].user;
        }
        keys.sort().reverse();
        for (let i = 0; i < keys.length; ++i) {
            let id = keys[i];
            let idString = '' + id + username[id];
            sortedObj[idString] = postsSaved[idString]
        }
        res.status(200).send(sortedObj);
    } catch (e) {
        console.log(e);
        res.status(400).send()
    }
})

module.exports = router