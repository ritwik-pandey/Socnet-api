const express = require('express');
const router = new express.Router();
var firebase = require('firebase');
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')
const cookieParser = require("cookie-parser");
router.use(cookieParser());



const { db, admin } = require('../db/firebase')


router.post('/:username', auth, async (req, res) => {

    const users = db.collection('users').doc(req.params.username);
    const doc = await users.get();
    if(!doc){
        res.send("No user found")
    }
    res.status(200).send(req.user.username)
})




module.exports = router