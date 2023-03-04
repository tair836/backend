import request from 'supertest'
import app from '../server'
import mongoose from 'mongoose'
import Post from '../models/post_model'
import User from '../models/user_model'
import Message from "../models/message_model"

let userId = ""

const userEmail = "user1@gmail.com"
const userPassword = "12345"
const userName = "user"
const newUserName = "user1"

let accessToken = ''
let refreshToken = ''
 
beforeAll(async ()=>{
    await Post.remove()
    await User.remove()
    await Message.remove()
})

afterAll(async ()=>{
    await Post.remove()
    await User.remove()
    await Message.remove()
    mongoose.connection.close()
})

describe("Auth Tests", ()=>{

    test("Not authorized attempt test",async ()=>{
        const response = await request(app).get('/post')
        expect(response.statusCode).not.toEqual(200)
    })

    test("Register test",async ()=>{
        const response = await request(app).post('/auth/register').send({
            "_email": userEmail,
            "password": userPassword,
            "name": userName,
            "image": "",
        })
        expect(response.statusCode).toEqual(200)
        userId = response.body._id
    })

    test("Login test wrong password", async ()=>{
        const response = await request(app).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword + '4'
        })
        expect(response.statusCode).not.toEqual(200)
        const tokens = response.body.tokens
        expect(tokens).toBeUndefined()
    })

    test("Login test", async ()=>{
        const response = await request(app).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword
        })
        expect(response.statusCode).toEqual(200)
        accessToken = response.body.tokens.accessToken
        expect(accessToken).not.toBeNull()
        refreshToken = response.body.tokens.refreshToken
        expect(accessToken).not.toBeNull()
    })

    test("login using valid access token ", async () => {
        const response = await request(app)
            .get("/post")
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
    });

    test("Test using wrong access token", async ()=>{
        const response = await request(app).get('/post').set('Authorization', 'JWT 1' + accessToken)
        expect(response.statusCode).not.toEqual(200)
    })

    jest.setTimeout(15000)
    test("Test expired token", async ()=>{
        await new Promise(r => setTimeout(r, 6000))
        const response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).not.toEqual(200)
    })

    test("Test refresh token", async ()=>{
        let response = await request(app).get('/auth/refresh').set('Authorization', 'JWT ' + refreshToken)
        expect(response.statusCode).toEqual(200)

        accessToken = response.body.accessToken
        expect(accessToken).not.toBeNull()
        refreshToken = response.body.refreshToken
        expect(refreshToken).not.toBeNull()

        response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(200)
    })


    test("get user by id", async () => {
        const response = await request(app)
            .get("/auth/" + userId)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        console.log(response.body);
        expect(response.body._id).toEqual(userId);
        expect(response.body.name).toEqual(userName);
    });

    test("update user by Id", async () => {
        let response = await request(app)
            .put("/auth/" + userId)
            .set("Authorization", "JWT " + accessToken)
            .send({
                name: newUserName,
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body.name).toEqual(newUserName);
        expect(response.body._id).toEqual(userId);

        response = await request(app)
            .get("/auth/" + userId)
            .set("Authorization", "JWT " + accessToken);
        expect(response.statusCode).toEqual(200);
        expect(response.body.name).toEqual(newUserName);
        expect(response.body._id).toEqual(userId);

        response = await request(app)
            .put("/auth/12345")
            .set("Authorization", "JWT " + accessToken)
            .send({
                name: newUserName,
            });
        expect(response.statusCode).toEqual(400);
    });

    test("Logout test", async ()=>{
        const response = await request(app).get('/auth/logout').set('Authorization', 'JWT ' + refreshToken)
        expect(response.statusCode).toEqual(200)
    })
})
