import request from 'supertest'
import app from '../server'
import mongoose from 'mongoose'
import Post from '../models/post_model'
import User from '../models/user_model'

const userEmail = "user1@gmail.com"
const userPassword = "12345"
let accessToken = ''

beforeAll(async ()=>{
    await Post.remove()
    await User.remove()
})

afterAll(async ()=>{
    await Post.remove()
    await User.remove()
    mongoose.connection.close()
})

describe("Auth Tests", ()=>{
    test("Register test",async ()=>{
        const response = await request(app).post('/auth/register').send({
            "email": userEmail,
            "password": userPassword 
        })
        expect(response.statusCode).toEqual(200)
    })

    test("Login test",async ()=>{
        let response = await request(app).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword 
        })
        expect(response.statusCode).toEqual(200)
        accessToken = response.body.accesstoken
        expect(accessToken).not.toBeNull()

        response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200)
 
        response = await request(app).get('/post').set('Authorization', 'JWT 1' + accessToken);
        expect(response.statusCode).not.toEqual(200)
    })

    test("Login test wrog password",async ()=>{
        const response = await request(app).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword + '4'
        })
        expect(response.statusCode).not.toEqual(200)
        const access = response.body.accesstoken
        expect(access).toBeUndefined()
    })

    test("Logout test",async ()=>{
        const response = await request(app).post('/auth/logout').send({
            "email": userEmail,
            "password": userPassword 
        })
        expect(response.statusCode).toEqual(200)
    })
    
})