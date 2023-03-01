import request from 'supertest'
import app from '../server'
import mongoose from 'mongoose'
import User from '../models/user_model'

const userEmail = "user1@gmail.com"
const userPassword = "12345"
const avatarUrl = "http://192.168.128.1:3000/oren.jpg"
let newUserId = ""
const newUserEmail = "user2@gmail.com"
let accessToken = ""


beforeAll(async () => {
    await User.remove()
    await request(app).post('/auth/register').send({
        "email": userEmail,
        "password": userPassword,
        "avatarUrl": avatarUrl 
    })
})

async function loginUser() {
    const response = await request(app).post('/auth/login').send({
        "email": userEmail,
        "password": userPassword,
        "avatarUrl": avatarUrl 
    })
    accessToken = response.body.accessToken
}


beforeEach(async ()=>{
    await loginUser()
})

afterAll(async () => {
    await User.remove()
    mongoose.connection.close()
})

describe("User Tests", () => {
    test("Add new user", async () => {
        const response = await request(app).post('/auth/register')
            .send({
                "email": newUserEmail,
                "password": userPassword,
                "avatarUrl": avatarUrl
            })
        expect(response.statusCode).toEqual(200)
        expect(response.body.email).toEqual(newUserEmail) 
        newUserId = response.body._id   
    })

    test("Get user by id", async () => {
        const response = await request(app).get('/user/' + newUserId).set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(200)
    })

    test("Update user",async ()=>{
        let response = await request(app).put('/user/' + newUserId).set('Authorization', 'JWT ' + accessToken)
        .send({
            "email": newUserEmail,
            "password": userPassword,
            "avatarUrl": avatarUrl
        })
        expect(response.statusCode).toEqual(200)
        expect(response.body.email).toEqual(newUserEmail)
        expect(response.body.password).toEqual(userPassword)
        expect(response.body.avatarUrl).toEqual(avatarUrl)

        response = await request(app).put('/user/' + newUserId).set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(200)
        expect(response.body.email).toEqual(newUserEmail)
        expect(response.body.password).toEqual(userPassword)
        expect(response.body.avatarUrl).toEqual(avatarUrl)

        response = await request(app).put('/user/12345').set('Authorization', 'JWT ' + accessToken)
        .send({
            "email": newUserEmail,
            "password": userPassword,
            "avatarUrl": avatarUrl
        })
        expect(response.statusCode).toEqual(400)
 
        response = await request(app).put('/user/' + newUserId).set('Authorization', 'JWT ' + accessToken)
        .send({
            "password": userPassword,
            "avatarUrl": avatarUrl       
        })
        expect(response.statusCode).toEqual(200)
        expect(response.body.email).toEqual(newUserEmail)
        expect(response.body.password).toEqual(userPassword)
        expect(response.body.avatarUrl).toEqual(avatarUrl)

    })
})