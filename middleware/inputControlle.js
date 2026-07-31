const { z } = require("zod") ;

const registerSchema = z.object ({
      username : z.string({invalid_type_error: "Username must be text"}).min(4 , "Username must be at least 4 characters") ,
      password : z.string().min(6 , "password must be at least 6 characters")
}) ;

const inputController = ( req , res , next ) => {
      const infos = req.body ;
      const result = registerSchema.safeParse(infos) ;

      if (!result.success) {
            const errorMessage = result.error.issues[0].message
            return res.status(400).json({ 'message' : errorMessage }) ;
      }
      next() ;
};

module.exports = inputController ;
