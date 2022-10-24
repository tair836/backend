

const getAllPosts = (req,res,next)=>{
    res.send('get all posts')
}

const addNewPost = (req,res,next)=>{
    res.send('add new post')
}

module.exports = {getAllPosts, addNewPost}
