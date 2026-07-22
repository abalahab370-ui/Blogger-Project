const jwt = require("jsonwebtoken") ;
const User = require("../Data/users") ;
require("dotenv").config() ;

const refreshTokenControlle = async (req , res ) => {

      try {
      const cookies = req.cookies
      if (!cookies?.jwt) {
            return res.sendStatus(403) ;
      }

      const refreshToken = cookies.jwt ;
      const founduser = await User.findOne( { "refreshToken" : refreshToken }).exec() ;


      if (!founduser) {
            console.log("❌ Kicked out with 401: Token not found in database!")
           return res.sendStatus(401);
      }


      jwt.verify( 
            refreshToken ,
            process.env.REFRESH_TOKEN_SECRET ,
            ( err ,decoded) => {
                  if (err || !founduser.username === decoded.username ) {
                        return res.sendStatus(403) ; //forbidden cuz invalide token !
                  }
                  const roles = Object.values(founduser.roles) ;
                  const accessToken = jwt.sign(
                  {"userInfo" : {
                  username : founduser.username ,
                  roles :  roles // will help us in specifying the req !
                  }} ,
                  process.env.ACCESS_TOKEN_SECRET ,
                  { expiresIn : '2h'}
                  );
                  return res.json({accessToken});
            }
      );
      } catch (err) {
            console.error(`Sir we have an error in refreshing Tokens : ${err}`);
      }
}
module.exports = refreshTokenControlle ;
