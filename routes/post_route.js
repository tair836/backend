const express = require('express')
const router = express.Router()
const post = require('../controllers/post.js')

router.get('/',post.getAllPosts)

router.post('/',post.addNewPost)

module.exports = router