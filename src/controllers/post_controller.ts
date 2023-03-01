import { Request, Response } from 'express'
import Post from '../models/post_model'

const getPosts = async (req: Request, res: Response) => {
	try{
		const posts = await Post.find()
		res.status(200).json(posts)
    }catch(err){
        res.status(400).send({'error':"fail to get posts from db"})
    }
}
const createPost = async (req: Request, res: Response) => {
	const post = new Post({
		email: req.body.userPost.email,
		body: req.body.userPost.body,
		name: req.body.userPost.name,
		imageURL: req.body.userPost.imageURL,
	})
	try{
        const newPost = await post.save()
        res.status(200).send(newPost)
    }catch (err){
        res.status(400).send({'error': 'fail adding new post to db'})
    }
}
const deletePost = async (req: Request, res: Response) => {
	try{
		await Post.findByIdAndDelete(req.params.id)
		res.status(200).json()
	} catch (err){
		res.status(400).send({'error': 'user not exist'})
	}
}

const updatePostByID = async (req: Request, res: Response) => {
	try{
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, {new: true})
        res.status(200).send(post)
    }catch (err){
        console.log("fail to update post in db")
        res.status(400).send({'error': 'fail adding new post to db'})
    }
}

export = { getPosts, createPost, deletePost, updatePostByID }