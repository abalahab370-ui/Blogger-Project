const mongoose = require("mongoose") ;
const Posts = require("../Data/posts") ;

const postsDeleteHandler = async ( req , res ) => {
      try {
            const { postId } = req.query ;
            if (!postId) {
                  return res.status(400).json({ 'message' : 'You Cant Delete This post' })
            }

            const post = await Posts.findOne( { _id : postId })

            if ( req.roles === 2020 || req.user === post.author  ) {
                  
            const result = await Posts.deleteOne({
                   _id: postId
            });

            return res.sendStatus(200); //bored to add a message =-= but not a note *-*

            } else  {
                  return res.status(400).json({ 'message' : 'You Cant Delete This post' })
            }

      } catch (err) {
            console.error( `Sir we have a problem in Deleting Posts : ${err}`) ;
      }
}

module.exports = postsDeleteHandler ;