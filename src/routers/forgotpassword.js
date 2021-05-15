const express = require('express');
const router = new express.Router();
const bcrypt = require('bcrypt')
const db = require('../db/firebase')


router.post('/forgotpassword' ,async (req , res) => {
    const username = req.body.username
    const email = req.body.email
    try{
        const usersdata = db.collection('users').doc(req.body.username);
        const doc = await usersdata.get();
        if(doc && doc.data().confirmed != false){
            bcrypt.compare(email, doc.data().email).then(function(result) {
                if(result == true){
                    res.status(200).send();
                }else{
                    res.status(400).send("Email not valid");
                }
            });
        }else{
            res.status(400).send("Username not found");
        }
    }catch(e){
        res.status(400).send(e);
    }
})


module.exports = router