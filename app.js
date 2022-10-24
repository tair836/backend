const express = require('express')
const app = express()
const dotenv = require('dotenv').config()

const postRouter = require('./routes/post_route.js')
app.use('/post',postRouter)


app.listen(process.env.PORT,()=>{
    console.log('Server started')    
})

