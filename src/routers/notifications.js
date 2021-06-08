const express = require('express');
const router = new express.Router();

const auth = require('../middleware/auth')
const { db, admin } = require('../db/firebase')

router.post('/notifications' , auth , async (req, res) => {
    try {
        const users = db.collection('notifications').doc(req.user.username);
        const doc = await users.get();
        res.status(200).send(doc.data().notifications);
    } catch (error) {
        res.status(400).send();
    }
})


module.exports = router;