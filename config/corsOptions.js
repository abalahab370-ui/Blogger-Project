const cors = require("cors") ;

//Cross Origin Resource Sharing :
const whitelist = [
      'https://blogger-project-n6s6.onrender.com',
      'http://127.0.0.1:5500'
];

const corsOptions = {
      origin: (origin , callback) => {
            if (!origin || whitelist.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                  callback(null , true)
            } else {
                  callback(new Error('Not allowed by Cors'));
            }
      },
      credentials: true ,
      optionsSuccessStatus: 200 
}
module.exports = corsOptions ;