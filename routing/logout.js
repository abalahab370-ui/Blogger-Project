const express = require("express") ;
const router = express.Router() ;
const logoutHandler = require("../Controllers/logoutHandler") ;

router.post( '/' , logoutHandler ) ;

module.exports = router ;