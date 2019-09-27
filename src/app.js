require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const winston = require('winston');
const medLogRouter = require('./medLog/medLog-router')
const upcomingApptsRouter = require('./upcoming_appts/upcoming_appts-router')
const pastApptsRouter = require('./past_appts/past_appts-router')
const usersRouter = require('./users/user-router')
const authRouter = require('./auth/auth-router')


const app = express()


const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'info.log' })
    ]
  });
  
  if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }


    app.use(morgan(morganOption))
    app.use(cors())
    app.use(helmet())
   app.use(express.json());

app.use('/api/medLog', medLogRouter)
app.use('/api/upcoming_appts', upcomingApptsRouter)
app.use('/api/past_appts', pastApptsRouter)
app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)

app.get('/', (req, res) => {
      res.send('Hello, world!')
     })


app.use(function errorHandler(error, req, res, next) {
       let response
       if (NODE_ENV === 'production') {
         response = { error: { message: 'server error' } }
       } else {
         console.error(error)
         response = { message: error.message, error }
       }
       res.status(500).json(response)
     })
    

module.exports = app