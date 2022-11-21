import express from 'express'
const router = express.Router()
import auth from '../controllers/auth.js'

router.post('/register',auth.register)

router.post('/login',auth.login)

router.post('/logout',auth.logout)

export = router

