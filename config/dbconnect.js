const mongoose = require('mongoose') ;


const connectDB = async () => {

      try{
            await mongoose.connect(process.env.DATABASE_URI)
      } catch (err) {
            console.error(`Sir we have error in Connectiong to Database!`)
      }
} ;

module.exports = connectDB ;