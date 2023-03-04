import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        //required: true
    },
    refresh_tokens: {
        type: [String]
    }
})

export = mongoose.model('User',userSchema)