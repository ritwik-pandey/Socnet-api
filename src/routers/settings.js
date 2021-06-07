const express = require('express');
const router = new express.Router();
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')
const { db, admin } = require('../db/firebase')

router.post('/settings', auth, (req, res) => {
    try {
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
})

module.exports = router