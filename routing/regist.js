const express = require("express") ;
const router = express.Router() ;
const path = require("path");
const registHandler = require('../Controllers/registHandler') ;
const inputController = require('../middleware/inputControlle') ;

router.get ( '/' , (req , res) => {
     res.redirect("/api");
});

router.post( '/' , inputController ,registHandler ) ;

router.post( '/regist' , inputController ,registHandler ) ;
      

module.exports = router ;