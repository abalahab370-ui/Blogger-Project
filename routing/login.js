const express = require("express") ;
const router = express.Router() ;
const path = require('path');
const loginHandler = require('../Controllers/loginHandler.js') ;

router.get ( '/' , (req , res) => {
      return res.sendFile(path.join(__dirname , ".." , "Public" , "login.html"));
});

router.post( '/' , loginHandler ) ;

router.post( '/login' , loginHandler ) ;
      

module.exports = router ;