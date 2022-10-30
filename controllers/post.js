
const Post = require('../models/post_model')

const getAllPosts = async (req,res,next)=>{
    try{
        let posts = {}
        if (req.query.sender == null){
            posts = await Post.find()
        }else{
            posts = await Post.find({'sender' : req.query.sender})
        }
        res.status(200).send(posts) 
    }catch(err){
        res.status(400).send({'error':"fail to get posts from db"})
    }
}

const getPostById = async (req,res,next)=>{
    console.log(req.params.id)

    try{
        const posts = await Post.findById(req.params.id)
        res.status(200).send(posts) 
    }catch(err){
        res.status(400).send({'error':"fail to get posts from db"})
    }
}



const addNewPost = async (req,res,next)=>{
    console.log(req.body)

    const post = new Post({
        message: req.body.message,
        sender: req.body.sender
    })

    try{
        newPost = await post.save()
        console.log("save post in db")
        res.status(200).send(newPost)
    }catch (err){
        console.log("fail to save post in db")
        res.status(400).send({'error': 'fail adding new post to db'})
    }
}


module.exports = {getAllPosts, addNewPost, getPostById}
