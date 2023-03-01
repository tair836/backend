import request from 'supertest'
import app from '../server'
import mongoose from 'mongoose'
import Post from '../models/post_model'
import User from '../models/user_model'

const userEmail = "user1@gmail.com"
const userPassword = "123456"
const avatarUrl = "http://192.168.128.1:3000/oren.jpg"
let userId = ''
let accessToken = ''
let refreshToken = ''

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

    test("Not aquthorized attempt test",async ()=>{
        const response = await request(app).get('/post');
        expect(response.statusCode).not.toEqual(200)
    })

    test("Register test",async ()=>{
        const response = await request(app).post('/auth/register').send({
            "email": userEmail,
            "password": userPassword,
            "avatarUrl": avatarUrl 
        })
        expect(response.statusCode).toEqual(200)
        expect(response.body.email).toEqual(userEmail)
        userId = response.body._id
    })

    test("Login test wrog password",async ()=>{
        const response = await request(app).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword + '4'
        })
        expect(response.statusCode).not.toEqual(200)
        expect(response.body.accesstoken).toBeUndefined()
    })

    test("Login test",async ()=>{
        const response = await request(app).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword 
        })
        expect(response.statusCode).toEqual(200)
        expect(response.body.accessToken).not.toBeNull()
        expect(response.body.refreshToken).not.toBeNull()
    })

    // test("Test using valid access token",async ()=>{
    //     const response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
    //     expect(response.statusCode).toEqual(200)
    // })

    // test("Test sign wrong access token",async ()=>{
    //     const response = await request(app).get('/post').set('Authorization', 'JWT 1' + accessToken);
    //     expect(response.statusCode).not.toEqual(200)
    // })

    jest.setTimeout(30000)

    test("Test expiered token",async ()=>{
        await new Promise(r => setTimeout(r,6000))
        const response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).not.toEqual(200)
    })

    // test("Test refresh token",async ()=>{
    //     let response = await request(app).get('/auth/refresh').set('Authorization', 'JWT ' + refreshToken);
    //     expect(response.statusCode).toEqual(200)
    //     expect(response.body.accessToken).not.toBeNull()
    //     expect(response.body.refreshToken).not.toBeNull()        
    //     response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
    //     expect(response.statusCode).toEqual(200)
    // })

    // test("Logout test",async ()=>{
    //     const response = await request(app).get('/auth/logout').set('Authorization', 'JWT ' + refreshToken)
    //     expect(response.statusCode).toEqual(200)
    // })
    
})