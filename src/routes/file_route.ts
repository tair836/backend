/**
* @swagger
* tags:
*   name: File
*   description: Files upload
*/

import express, { Request, Response } from 'express'
const router = express.Router()

import multer from 'multer'

const base = "http://192.168.128.1:3000/"
const storage = multer.diskStorage({
    destination: function (req: Request, file: unknown, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        console.log('multer storage callback')
        cb(null, Date.now() + '.jpg')
    }
})

const upload = multer({ storage: storage });

router.post('/file', upload.single("file"), function (req: Request, res: Response) {
    console.log("router.post(/file: " + base + req.file.path)
    res.status(200).send({ url: base + req.file.path })
});


export = router