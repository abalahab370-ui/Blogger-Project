require("dotenv").config() ;
const express = require("express") ;
const app = express() ;
const cors = require("cors") ;
const PORT = process.env.PORT || 5500 ;
const path = require("path") ;
const corsOptions = require("./config/corsOptions") ;
const cookieParser = require("cookie-parser") ;
const mongoose  = require("mongoose") ;
const connectDB = require("./config/dbconnect") ;

//Connecting to The DataBase : 
connectDB() ;

//Starting with building schema of the project  : 
//1- Staring with puting same Neccesary middleware !

app.use(express.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname , "Public"))); // Coming Back to it Later !
app.use(express.json());

//middleware for cookies :
app.use(cookieParser()) ;

app.use(cors(corsOptions));

//Custom Middleware To log each req coming to the Server :
app.use( (req ,res,next) => {
      console.log(`${req.method} ${req.path} ${req.headers.origin}`);
      next();
})

//3-Starting To Handle Row req ( post , req , get , put ) ! 

app.use('/api' , require("./routing/login") ) ;

app.use('/api/regist' , require("./routing/regist") ) ;

//time for verfieJWT =-= !

app.all( '/*' , (req ,res) => {
      return res.sendStatus(404) ;
});


mongoose.connection.once("open" , () => {

      app.listen( PORT , 
            () => {
                  console.log('Connected to MongoDB') ;
                  console.log(`Server is listining in Port ${PORT}`)
            }
      );

})