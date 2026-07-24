const express = require("express") ;
const mongoose = require("mongoose") ;
const Posts = require("../Data/posts.js") ;

const gettingPostsHandler = async ( req , res ) => {
      try {
            const { search , author } = req.query;

            console.log("search:", search);
            console.log("author:", author);

            let filter = {} ;

            if (author) {
                  filter.author = author ;
                  if (search) {
                  filter.$or = [
                        { title : { $regex : search , $options : 'i'} } ,
                        { category : { $regex : search , $options : 'i'} }    
                        ]
                  }
            } else if (search) {
                  filter = {
                        $or : [
                        { title : { $regex : search , $options : 'i'}} ,
                        { category : { $regex : search , $options : 'i'}} ,
                        { author : { $regex : search , $options : 'i'}} 
                        ]
                  }
            }
            

            const post = await Posts.find(filter).sort( {createdAt : -1}) ;

            return res.json(post) //it can be an empty array if there is no match !

      } catch (err) {
            console.error(`Sir we have an error in Getting Posts : ${err}`) ;
      }

} ;

module.exports = gettingPostsHandler ; 