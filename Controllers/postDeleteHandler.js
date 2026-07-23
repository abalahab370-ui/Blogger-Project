const mongoose = require("mongoose") ;
const Posts = require("../Data/posts") ;

const postsDeleteHandler = async ( req , res ) => {
      try {
            const { postId } = req.query ;
            if (!postId || req.roles !== 2020) {
                  return res.status(400).json({ 'message' : 'You Cant Delete This post' })
            }

            const result = await Posts.deleteOne({
                   _id: postId
            });

            console.log(result) //just for debug !

            return res.sendStatus(200); //bored to add a message =-= but not a note *-*
      } catch (err) {
            console.error( `Sir we have a problem in Deleting Posts : ${err}`) ;
      }
}

module.exports = postsDeleteHandler ;