const express = require('express');
const router = new express.Router();
var firebase = require('firebase');
const jwt = require('jsonwebtoken')


const { db, admin } = require('../db/firebase')


router.post('/:username' , (req , res) => {
    res.status(200).send(req.params.username)
})



module.exports = router