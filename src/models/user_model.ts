import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
	email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        required: true
    },
    refresh_tokens: {
        type: [String]
    }
})

export default mongoose.model('User', UserSchema)