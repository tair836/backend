import Message from "../models/message_model"
import request from "../request"
import response from "../response"
import error from "../error"

const getAllMessages = async (req: request) => {
    // implement the get all messages with specific sender
    try {
        let messages = {};

        if (req.query != null && req.query.sender != null) {
            messages = await Message.find({ sender: req.query.sender })
        } else {
            messages = await Message.find()
        }
        return new response(messages, req.userId, null)
    } catch (err) {
        console.log("err");
        return new response(null, req.userId, new error(400, err.message))
    }
}

const addNewMessage = async (req: request) => {
    const message = new Message({
        message: req.body["message"],
        sender: req.userId,
    })
    console.log("end creation new message")
    console.log("message is: " + req.body["message"])
    console.log("sender is: " + req.userId)

    try {
        const newMessage = await message.save()
        console.log("save message in db")
        return new response(newMessage, req.userId, null)
    } catch (err) {
        console.log("saving message in db failed")
        console.log(err)

        return new response(null, req.userId, new error(400, err.message))
    }
}

export = { getAllMessages, addNewMessage }