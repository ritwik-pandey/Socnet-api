const jwt = require('jsonwebtoken')
const { db, admin } = require('../db/firebase');


const auth = async (req, res, next) => {
    try {
        const token = req.body.cookie;
        const decoded = jwt.verify(token, process.env.SECRET)
        const users = db.collection('users').doc(decoded.username);
        const doc = await users.get();
        if (!doc.exists) {
            throw new Error()
        } else {
            req.user = doc.data()
        }
        next();
    } catch (e) {
        res.status(401).send()
    }
}

module.exports = auth


