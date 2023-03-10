import { NextFunction, Request, Response } from 'express'
import User from '../models/user_model'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

function sendError(res:Response, error:string) {
    res.status(400).send({
        'err': error
    })
}

const register = async (req:Request, res:Response)=>{
    console.log('register in backend')

    const email = req.body._email
    const password = req.body.password
    const name = req.body.name
    const avatarUrl = req.body.image
    console.log("url: " + avatarUrl)

    //check if credentials are valid
    if (email == null || password == null || name == null || avatarUrl == null) {
        console.log('empty credentials')
        return sendError(res, "please provide valid email and password")
    }

    // check if the user is not already registered
    try {
        const user = await User.findOne({'email': email})
        if(user != null) {
            console.log('user already registeredd')
            return sendError(res, "user already registered, try a different name")
        }
        
        // create new User & encrypt password
        const salt = await bcrypt.genSalt(10)
        const encryptedPwd = await bcrypt.hash(password, salt)
        const newUser = new User({
            'email': email,
            'password': encryptedPwd,
            'name': name,
            'imageUrl': avatarUrl,
        })
        console.log('saving new user')
        await newUser.save()
        // TODO: fix the return value - need to change the return value to email instead of id
        console.log("success in saving")
        return res.status(200).send({
            'email' : email,
            '_id' : newUser._id,
        })

    } catch(err) {
        return sendError(res,'fail ...')
    }
}

async function generateTokens(userId:string){
    const accessToken = jwt.sign(
        {'id': userId},
        process.env.ACCESS_TOKEN_SECRET,
        {'expiresIn':process.env.JWT_TOKEN_EXPIRATION}
    )
    const refreshToken = jwt.sign(
        {'id': userId},
        process.env.REFRESH_TOKEN_SECRET
    )

    return {'accessToken':accessToken, 'refreshToken':refreshToken}
}

const login = async (req:Request, res:Response)=>{
    console.log('login in backend')
    const email = req.body.email
    const password = req.body.password
    if (email == null || password == null) {
        console.log('credentials are empty')
        return sendError(res, "please provide valid email and password")
    }
    console.log('credentials are not empty')

    try {
        const user = await User.findOne({'email': email})
        if(user == null) {
            console.log('user is null')
            return sendError(res, "incorrect user or password")
        }
        
        const match = await bcrypt.compare(password, user.password)
        if(!match) {
            console.log('not matching')
            return sendError(res, "incorrect user or password")
        }

        const tokens = await generateTokens(user._id.toString())
       
        console.log('generated tokens')
        if (user.refresh_tokens == null) user.refresh_tokens = [tokens.refreshToken]
        else user.refresh_tokens.push(tokens.refreshToken)
        await user.save()

        console.log(tokens)

        // check if the return is really needed
        return res.status(200).send({'tokens':tokens, 'userId':user._id})    
    } catch(err){
        console.log("error: " + err)
        return sendError(res, "failed checking user")
    }
}

function getTokenFromRequest(req:Request): string{
    const authHeader = req.headers['authorization']
    if (authHeader == null) return null
    return authHeader.split(' ')[1]
}

type TokenInfo = {
    id: string
}

const refresh = async (req:Request, res:Response)=>{
    const refreshToken = getTokenFromRequest(req)
    if(refreshToken == null) return sendError(res,'authentication missing')

    // verifying the refresh token
    try {
        const user: TokenInfo = <TokenInfo>jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
        const userObj = await User.findById(user.id)
        if (userObj == null) return sendError(res,'failed validating token')
        
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = [] // deleting all the the refresh tokens
            await userObj.save()
            return sendError(res, 'failed validating token')
        }

        const tokens = await generateTokens(userObj._id.toString())
        
        // TODO:
        // missing assignment in this statement 
        userObj.refresh_tokens[userObj.refresh_tokens.indexOf(refreshToken)] = tokens.refreshToken
        await userObj.save()

        return res.status(200).send(tokens)

    }catch(err) {
        return sendError(res,'failed validating token')
    }
}

const logout = async (req:Request, res:Response)=>{
    const refreshToken = getTokenFromRequest(req)
    if(refreshToken == null) return sendError(res,'authentication missing')

    try {
        const user = <TokenInfo>jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userObj = await User.findById(user.id)
        if (userObj == null) return sendError(res,'failed validating token')
        
        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = [] // deleting all of the the refresh tokens
            await userObj.save()
            return sendError(res, 'failed validating token')
        }

        userObj.refresh_tokens.splice(userObj.refresh_tokens.indexOf(refreshToken), 1)
        await userObj.save()
        return res.status(200).send()

    }catch(err) {
        return sendError(res,'failed validating token')
    }
}

const getUserById = async (req: Request, res: Response) => {
    console.log(req.params.id)
    try {
        const user = await User.findById(req.params.id)
        res.status(200).send(user)
    } catch (err) {
        res.status(400).send({ 'error': "fail to get user from db" })
    }
}

const updateUserById = async (req: Request, res: Response) => {
    console.log("in updateUserById");
    console.log(req.params.id);
    console.log(req.body.password);
    if (req.body.password != undefined) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        console.log("save post in db");
        res.status(200).send(user);
    } catch (err) {
        console.log("fail to update post in db");
        res.status(400).send({ error: "fail to update post in db" });
    }
};


const authenticateMiddleware = async (req:Request, res:Response, next:NextFunction)=>{
    console.log("in authenticate middleware")
    const token = getTokenFromRequest(req)
    if(token == null) return sendError(res,'authentication missing')

    try {
        const user = <TokenInfo>jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        req.body.userId = user.id
        console.log("token user:")
        return next()
    }catch(err) {
        return res.status(410).send({'err': 'failed validating token'}) 
    }
}

export = {login, register, logout, refresh, authenticateMiddleware, getUserById, updateUserById}


