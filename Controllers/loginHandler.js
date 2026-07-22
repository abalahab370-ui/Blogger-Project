const Users = require('../Data/users') ;
const jwt = require('jsonwebtoken') ;
const bcrypt = require("bcrypt") ;


const loginHandler = async (req , res) => {

            try {
                  
            const user = req.body ;
      
            if (!user.username || !user.password) {
                  return res.sendStatus(401);
            }
            
            const founduser = await Users.findOne({
                  username : user.username 
            }).exec() ;

            if (!founduser) {
                  return res.sendStatus(401);
            }

            const match = await bcrypt.compare ( user.password , founduser.password ) ;
            
            if (match) {
                  const roles = Object.values(founduser.roles) ; // array with only value exemple : [2000 , 4000]
                   //JWTs in Next Chapter !
                  const accessToken = jwt.sign(
                  {"userInfo" : {
                         username : founduser.username ,
                          roles :  roles // will help us in specifying the req !
                  }} ,
                          process.env.ACCESS_TOKEN_SECRET ,
                          { expiresIn : '2h'}
                  );
            
                  const refreshToken = jwt.sign(
                        { "username" : founduser.username } ,
                        process.env.REFRESH_TOKEN_SECRET ,
                        { expiresIn : '6h'}
                  );
      
            founduser.refreshToken = refreshToken ;
      
            const result = await founduser.save() ;
                  console.log(result);
            
            res.cookie( 'jwt' , refreshToken , { httpOnly : true , maxAge : 24 * 60 * 60 * 1000})
            res.json ({accessToken}) ;

            } else {
                  return res.sendStatus(403)
            }

            
            } catch (err){

                  console.error(`Sir We have an error in LOGIN users !`)

            } 

}

module.exports = loginHandler ;
