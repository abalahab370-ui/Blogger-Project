const express = require("express") ;
const router = express.Router() ;
const path = require("path");
const registHandler = require('../Controllers/registHandler') ;


router.get ( '/' , (req , res) => {
     res.redirect("/api");
});

router.post( '/' , registHandler ) ;

router.post( '/regist' , registHandler ) ;
      

module.exports = router ;