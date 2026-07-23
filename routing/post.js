const express = require("express") ;
const router = express.Router() ;
const postsCreationHandler = require("../Controllers/postsCreationHandler") ;
const postsGettingHandler = require("../Controllers/gettingPostHandler") ;
const postsDeleteHandler = require("../Controllers/postDeleteHandler") ;

router.post( '/' , postsCreationHandler ) ;

router.get( '/' , postsGettingHandler ) ;

router.delete ( '/' , postsDeleteHandler ) ;

module.exports = router ;