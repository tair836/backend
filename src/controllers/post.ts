import Post from '../models/post_model'

import request from "../request";
import response from "../response";
import error from "../error";


const getAllPosts = async (req:request) => {
    console.log("new version of get all posts")
    try {
        let posts = {}
        console.log("getAllPosts")
        console.log("req")
        console.log(req)
        if (req.query != null && req.query.sender != null) {
            posts = await Post.find({ sender: req.query.sender })
        } else {
            posts = await Post.find()
        }
        return new response(posts, req.userId, null)
    } catch (err) {
        console.log("err")
        return new response(null, req.userId, new error(400, err.message))
    }
}


const getPostById = async (req:request)=>{
    console.log(req.params.id)

    try {
        const posts = await Post.findById(req.params.id)
        return new response(posts, req.userId, null)
    } catch (err) {
        console.log("fail to get post from db")
        return new response(null, req.userId, new error(400, err.message))
    }
}

const addNewPost = async (req: request)=>{
    console.log("in add new post")
    console.log("message: " + req.body["message"])
    console.log("sender: " + req.body["sender"])
    console.log("image: " + req.body["image"])
    const post = new Post({
        message: req.body["message"],
        sender: req.body["sender"],
        imageUrl: req.body["image"]
    })

    if(post.imageUrl == "") {
        console.log("image string emptyyyyyyyy")
    }
    try{
        const newPost = await post.save()
        console.log("save post in db")
        return new response(newPost, req.userId, null)
    } catch (err){
        console.log("fail to save post in db")
        return new response(null, req.userId, new error(400, err.message))
    }
}

const putPostById = async (req:request)=>{
    try{
        console.log("putPostById")
        console.log(req)
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, {new: true})
        return new response(post, req.userId, null)
    }catch (err){
        console.log("fail to update post in db")
        return new response(null, req.userId, new error(400, err.message))
    }
}

const deletePostById = async (req: request) => {
    console.log(req.params.id);
    try {
        await Post.findByIdAndDelete(req.params.id);
        console.log("delete post from db");
        return new response(null, req.userId, null);
    } catch (err) {
        console.log("fail to delete post");
        console.log(err);
        return new response(null, req.userId, new error(400, err.message));
    }
};


export = {getAllPosts, addNewPost, getPostById, putPostById, deletePostById}