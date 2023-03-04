
import { Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import messageController from "../controllers/message"
import request from "../request"

export = (io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>, 
            socket:Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {
                
    // {'to': destination user id,
    //   'message' : message to send}

    const sendMessage = async (payload) => {
        console.log('chat:send_message')
        const message = payload.message
        const from = socket.data.user

        try {
            const response = await messageController.addNewMessage(
                new request(payload, from, null, null)
            )
            io.emit("chat:message",{from: from, message: message, res: response})
        } catch (err) {
            console.log("failed to send message: " + err)
            socket.emit("chat:message", { status: "fail" })
        }
    }

    const getAllMessages = async (payload) => {
        try {
            const response = await messageController.getAllMessages(
                new request(payload, socket.data.user, payload, null)
            )
            console.log("chat:get_all.response ")
            console.log("req - userId" + socket.data.user)
            console.log(response)
            
            io.to(socket.data.user).emit("chat:get_all.response", response)
        } catch (err) {
            socket.emit("chat:get_all.response", { status: "fail" })
        }
    }

    console.log('register chat handlers')
    socket.on("chat:send_message", sendMessage)
    socket.on("chat:get_all", getAllMessages)
}