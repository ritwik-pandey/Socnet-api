const express = require('express');
const app = express();
require('dotenv').config()
const userRouter = require('./routers/user')
const passwordRouter = require('./routers/forgotpassword')
const profileRouter = require('./routers/profile')

const port = process.env.PORT || 3000


app.use(express.json())
app.use(userRouter)
app.use(passwordRouter)
app.use(profileRouter)


app.listen(port, () => {
    console.log('Server is up on port ' + port);
})
