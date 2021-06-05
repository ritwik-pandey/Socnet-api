const express = require('express');
const router = new express.Router();
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')
const { db, admin } = require('../db/firebase')

router.post('/deleteProfile' , auth , (req, res) => {
    try {
        res.status(200).send(req.user.username)
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/deleteProfileFinal' , auth  , async (req , res) => {
    try {
        bcrypt.compare(req.body.input, req.user.password, function (err, result) {
            if (err) {
                res.status(400).send()
            } else if (result == true && req.user.confirmed == true) {
                    //jwt
                db.collection('users').doc(req.user.username).delete();
                db.collection('posts').doc(req.user.username).delete();
                res.status(200).send()  
                    
    
            } else {
                res.status(400).send()
            }
        });
        
       
    } catch (error) {
        res.status(400).send();
    }
})

router.post('/deletepost' , auth , async (req, res) => {
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