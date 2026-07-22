const cors = require("cors") ;

//Cross Origin Resource Sharing :
const whitelist = [
      'https://www.google.com',
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://127.0.0.1:5501',
      'http://localhost:5501',
      'http://127.0.0.1:3000',
      'http://localhost:3000'
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