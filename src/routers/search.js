const express = require('express');
const router = new express.Router();
var firebase = require('firebase');
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')

const { db, admin } = require('../db/firebase')

router.post('/search', auth, async (req, res) => {
    try {
        const users = db.collection('users').doc(req.body.username);
        const doc = await users.get();
        if (!doc.data()) {
            res.status(404).send();
        } else {
            res.status(200).send()
        }
    } catch (e) {
        res.status(400).send()
    }
})


module.exports = router