import request from 'supertest'
import app from '../server'
import mongoose from 'mongoose'
import Post from '../models/post_model'
import User from '../models/user_model'
import Message from "../models/message_model"


const firstPostMessage = 'This is the first new test post message'
const secondPostMessage = 'This is the second new test post message'

const firstPostImageUrl = 'imageUrl'


let firstPostSender = ''
let firstPostId = ''
const newPostMessageUpdated = 'This is the updated first post message'

const userEmail = "user1@gmail.com"
const userPassword = "12345"
const userName = "user1"
let accessToken = ''

beforeAll(async ()=>{
    await Post.remove()
    await User.remove()
    await Message.remove()
    const res = await request(app).post('/auth/register').send({
        "_email": userEmail,
        "password": userPassword,
        "name": userName,
        "image": "",
    })
    firstPostSender = res.body._id
    console.log("testing register:::")
    console.log(res.body._id)
})

async function loginUser() {
    const response = await request(app).post('/auth/login').send({
        "email": userEmail,
        "password": userPassword 
    })
    accessToken = response.body.tokens.accessToken
}

beforeEach(async ()=>{
    await loginUser()
})

afterAll(async ()=>{
    await Post.remove()
    await User.remove()
    await Message.remove()
    mongoose.connection.close()
})


describe("Posts Tests", ()=>{
    
    test("add new post", async ()=>{
        const response = await request(app).post('/post').set('Authorization', 'JWT ' + accessToken).send({
            "message": firstPostMessage,
            "sender": firstPostSender,
            "image": firstPostImageUrl,
        })
        expect(response.statusCode).toEqual(200)
        expect(response.body.post.message).toEqual(firstPostMessage)
        expect(response.body.post.sender).toEqual(firstPostSender)
        firstPostId = response.body.post._id
    })

    test("add second new post", async ()=>{
        const response = await request(app).post('/post').set('Authorization', 'JWT ' + accessToken).send({
            "message": secondPostMessage,
            "sender": firstPostSender,
            "image": firstPostImageUrl,
        })
        expect(response.statusCode).toEqual(200)
        expect(response.body.post.message).toEqual(secondPostMessage)
        expect(response.body.post.sender).toEqual(firstPostSender)
    })

    test("get all posts", async ()=>{
        const response = await request(app)
            .get("/post")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post[0].message).toEqual(firstPostMessage);
        expect(response.body.post[0].sender).toEqual(firstPostSender);
        expect(response.body.post[0].imageUrl).toEqual(firstPostImageUrl);
        expect(response.body.post.length).toEqual(2);
    })

    
    test("get post by id",async ()=>{
        const response = await request(app).get('/post/' + firstPostId).set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(200)
        expect(response.body.post.message).toEqual(firstPostMessage)
        expect(response.body.post.sender).toEqual(firstPostSender)
        expect(response.body.post.imageUrl).toEqual(firstPostImageUrl)
    })

    test("get post by wrong id fails",async ()=>{
        const response = await request(app).get('/post/12345').set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(400)
    })

    test("get post by sender",async ()=>{
        const response = await request(app)
            .get("/post?sender=" + firstPostSender)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        console.log(response.body);
        expect(response.body.post[0].message).toEqual(firstPostMessage);
        expect(response.body.post[0].sender).toEqual(firstPostSender);
        expect(response.body.post[0].imageUrl).toEqual(firstPostImageUrl);
        expect(response.body.post.length).toEqual(2);
    })

    test("get post by wrong sender", async () => {
        const response = await request(app)
            .get("/post?sender=12345")
            .set("Authorization", "JWT " + accessToken);
        console.log(response.body);
        expect(response.statusCode).toEqual(200);
        expect(response.body.post.length).toEqual(0);
    });

    test("update post by ID",async ()=>{
        let response = await request(app).put('/post/' + firstPostId).set('Authorization', 'JWT ' + accessToken).send({
            "message": newPostMessageUpdated,
            "sender": firstPostSender
        })
        expect(response.statusCode).toEqual(200)
        expect(response.body.post.message).toEqual(newPostMessageUpdated)
        expect(response.body.post.sender).toEqual(firstPostSender)
        expect(response.body.post.imageUrl).toEqual(firstPostImageUrl)

        response = await request(app).get('/post/' + firstPostId).set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(200)
        expect(response.body.post.message).toEqual(newPostMessageUpdated)
        expect(response.body.post.sender).toEqual(firstPostSender)
        expect(response.body.post.imageUrl).toEqual(firstPostImageUrl)

        response = await request(app).put('/post/12345').set('Authorization', 'JWT ' + accessToken).send({
            "message": newPostMessageUpdated,
            "sender": firstPostSender
        })
        expect(response.statusCode).toEqual(400)

        response = await request(app).put('/post/' + firstPostId).set('Authorization', 'JWT ' + accessToken).send({
            "message": newPostMessageUpdated,
        })
        expect(response.statusCode).toEqual(200)
        expect(response.body.post.message).toEqual(newPostMessageUpdated)
        expect(response.body.post.sender).toEqual(firstPostSender)
        expect(response.body.post.imageUrl).toEqual(firstPostImageUrl)
    })

    test("delete post by id", async () => {
        const response = await request(app)
            .delete("/post/" + firstPostId)
            .set("Authorization", "JWT " + accessToken);
        console.log(response.body);
        expect(response.statusCode).toEqual(200);
    });
})