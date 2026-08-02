const Users = require('../Data/users') ;
const jwt = require('jsonwebtoken') ;
const bcrypt = require("bcrypt") ;


const registHandler = async (req , res) => {

            try {
                  
            const user = req.body ;
      
            if (!user.username || !user.password) {
                  return res.sendStatus(401);
            }
            
            const founduser = await Users.findOne( {
                  username : user.username 
            }).exec() ;
            const duplicate = founduser ;

            if (duplicate) {
                  return res.status(409).json({'message' :'This username already exist choose a different one'});
            }

            const hashpwd = await bcrypt.hash(user.password , 10) ;
            console.log(user.password) ;
            const accessToken = jwt.sign(
                  {"userInfo" : {
                         username : user.username 
                  }} ,
                          process.env.ACCESS_TOKEN_SECRET ,
                          { expiresIn : '2h'}
                  );
            
            const refreshToken = jwt.sign(
                        { "username" : user.username } ,
                        process.env.REFRESH_TOKEN_SECRET ,
                        { expiresIn : '6h'}
                  );
      
            const newuser = Users.create ( {
                  username : user.username ,
                  password : hashpwd ,
                  refreshToken : refreshToken
            })

            res.cookie( 'jwt' , refreshToken , { httpOnly : true , maxAge : 24 * 60 * 60 * 1000})
            res.json ({accessToken}) ;
            } catch (err){

                  console.error(`Sir We have an error in Registring users !`);

            } 
}


module.exports = registHandler ;