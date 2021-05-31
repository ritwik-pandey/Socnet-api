const express = require('express');
const app = express();
require('dotenv').config()
const userRouter = require('./routers/user')
const passwordRouter = require('./routers/forgotpassword')
const profileRouter = require('./routers/profile')
const postsRouter = require('./routers/posts')
const viewPostRouter = require('./routers/viewPost')
const share = require('./routers/share')
const search = require('./routers/search')

const port = process.env.PORT || 3000


app.use(express.json())
app.use(userRouter)
app.use(passwordRouter)
app.use(postsRouter)
app.use(viewPostRouter)
app.use(share)
app.use(search)
app.use(profileRouter)


app.listen(port, () => {
    console.log('Server is up on port ' + port);
})
