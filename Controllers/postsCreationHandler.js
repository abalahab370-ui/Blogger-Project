const express = require("express") ;
const mongoose = require("mongoose") ;
const Posts = require("../Data/posts") ;

const postsCreationHandler = async ( req , res ) => {
      try {
            const post = req.body ;
            if (!post.title || !post.category || !post.content) {
                  return res.sendStatus(400) ; //Bad req !
            }

            //Creating the Post in Our DataBase !!
            const newpost = await Posts.create( {
                  title : post.title ,
                  category : post.category ,
                  content : post.content ,
                  author : req.user
            } ) ;

            return res.sendStatus(201) ;

      } catch (err) {
            console.error(`Sir we have a Problem in Creating Posts : ${err}`) ;
      }
}

module.exports = postsCreationHandler ;