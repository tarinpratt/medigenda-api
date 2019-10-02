const path = require('path')
const express = require('express')
const UsersService  = require('./user-service')
const usersRouter = express.Router()
const jsonBodyParser = express.json()


usersRouter
.route('/')
.get((req, res, next) => {
  const knexInstance = req.app.get('db')
  UsersService.getAllUsers(knexInstance)
    .then(users => {
    res.json(users)
    })
    .catch(next)
    })

.post(jsonBodyParser, (req, res, next) => {
  const { username, email, password } = req.body
    for (const field of ['username', 'email', 'password'])
    if (!req.body[field])
    return res.status(400).json({ error: `Missing '${field}' in request body` })
  const passwordError = UsersService.validatePassword(password)
    if (passwordError)
    return res.status(400).json({ error: passwordError })
  UsersService.hasUserWithUserName(
    req.app.get('db'),
    username
    )
    .then(hasUserWithUserName => {
    if (hasUserWithUserName)
    return res.status(400).json({ error: `Username already taken` })
    return UsersService.hashPassword(password)
    .then(hashedPassword => {
  const newUser = {
    username,
    email,
    password: hashedPassword,
    }
    return UsersService.insertUser(
      req.app.get('db'),
      newUser
    )
    .then(user => {
      res.status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(UsersService.serializeUser(user))
    })
    })
    })  
     .catch(next)
  })

usersRouter
  .route('/:users_id')
  .all((req, res, next) => {
    UsersService.getById(
      req.app.get('db'),
      req.params.users_id
    )
    .then(user => {
    if (!user) {
    return res.status(404).json({ error: { message: `user does not exist` } })
    }
    res.user = user
    next()
    })
    .catch(next)
    })
  .get((req, res) => { res.json(res.user) }
)

module.exports = usersRouter;

