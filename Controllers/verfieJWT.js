const jwt = require("jsonwebtoken") ;
require("dotenv").config() ;

const verfieJWT =  (req , res , next ) => {
      const authHeader = req.headers.authorization || req.headers.Authorization ;
      if (!authHeader?.startsWith('Bearer ')) {
            return res.sendStatus(401) ;
      }
      const token = authHeader.split(' ')[1] ;
      jwt.verify( 
            token ,
            process.env.ACCESS_TOKEN_SECRET ,
            ( err ,decoded) => {
                  if (err) {
                        return res.sendStatus(403) ; //forbidden cuz invalide token
                  }
                  req.user = decoded.userInfo.username ; //So important !!!
                  req.roles = decoded.userInfo.roles ;
                  next();
            } 

      );

}
module.exports = verfieJWT ;