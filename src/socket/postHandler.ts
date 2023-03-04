import { Server, Socket } from "socket.io"
import { DefaultEventsMap } from "socket.io/dist/typed-events"
import postController from '../controllers/post'
import request from "../request"

export = (io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    socket:Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {

    const getAllPosts = async (body) => {
        console.log(
            "get all posts handler with socketId: %s",
            socket.data.user
        )
        try {
            const response = await postController.getAllPosts(
                new request(body, socket.data.user, null, null)
            )
            console.log("trying to send post:get_all.response")
            socket.emit("post:get.response", response)
        } catch (err) {
            socket.emit("post:get.response", { status: "fail" })
        }
    }
    
    const getPostById = async (body) => {
        console.log(
            "get post by id handler with socketId: %s",
            socket.data.user
        )
        try {
            const response = await postController.getPostById(
                new request(body, socket.data.user, null, body)
            )
            console.log("trying to send post:get:id.response")
            socket.emit("post:get:id.response", response)
        } catch (err) {
            socket.emit("post:get:id.response", { status: "fail" })
        }
    }

    const addNewPost = async (body) => {
        console.log("new post handler with socketId: %s", socket.data.user)
        try {
            const response = await postController.addNewPost(
                new request(body, socket.data.user, null, null)
            );
            console.log("trying to send post:post.response");
            socket.emit("post:post.response", response);
        } catch (err) {
            socket.emit("post:post.response", { status: "fail" });
        }
    }

    const getPostBySender = async (body) => {
        console.log(
            "get post by sender handler with socketId: %s",
            socket.data.user
        )
        try {
            const response = await postController.getAllPosts(
                new request(body, socket.data.user, body, null)
            );
            console.log("trying to send post:get:sender.response")
            socket.emit("post:get:sender.response", response)
        } catch (err) {
            socket.emit("post:get:sender.response", { status: "fail" })
        }
    }

    const updatePostById = async (body) => {
        console.log(
            "update post by id handler with socketId: %s",
            socket.data.user
        )
        try {
            const response = await postController.putPostById(
                new request(body, socket.data.user, null, body)
            );
            console.log("trying to send post:put.response")
            socket.emit("post:put.response", response)
        } catch (err) {
            socket.emit("post:put.response", { status: "fail" })
        }
    }

    console.log('register post handlers')
    socket.on("post:get", getAllPosts)
    socket.on("post:get:id", getPostById)
    socket.on("post:post", addNewPost)
    socket.on("post:get:sender", getPostBySender)
    socket.on("post:put", updatePostById)
}