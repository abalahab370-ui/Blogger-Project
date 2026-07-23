const mongoose = require("mongoose") ;
const Users = require("../Data/users") ;

const logoutHandler = async ( req , res ) => {
      try {
            console.log("Cookies:", req.cookies);
            
            const cookies = req.cookies ;
            if (!cookies?.jwt) {
                  return res.status(400).json({ 'message' : 'Ayo mate u dont even Have a RefreshToken Getout Of here !'})
            }

            const refreshToken = cookies.jwt ;
            const founduser = await Users.findOne( { refreshToken : refreshToken }).exec() ;

            console.log("Refresh token from cookie:", refreshToken);
            console.log("Found user:", founduser);

            if (!founduser) {
                  res.clearCookie('jwt' , {httpOnly : true , sameSite : 'None' , secure : true}) ;
                  return res.status(400).json({ 'message' : 'Ayo mate u dont even exist in my database what hell are u doing here !'})
            }

            founduser.refreshToken = '' ;
            await founduser.save() ;

           res.clearCookie('jwt' , {httpOnly : true , sameSite : 'None' , secure : true}) ;

            return res.sendStatus(200) ; // ho9 ho9 well done mate !

      } catch (err) {
            console.error( `Sir we have an error in Logout Users : ${err}`) ;
      }
} ;

module.exports = logoutHandler ;
