const express = require('express')
const cors = require('cors')

const userRoutes = require('./api/user/routes')
const projectRoutes = require('./api/collaborative/routes')
const friendRoutes = require('./api/friend/routes')

const { jwtCheck } = require('./config/auth')
const commentRoutes = require('./api/comment/routes')
const reactionRoutes = require('./api/reaction/routes')
const app = express()

const errController = (err, req, res, next) => {
  const error = { ...err }
  error.message = err.message
  console.log(error)
  if (error.code === '11000') {
    return res.status(400).json({ error: error.message })
  }
  return res.status(500).json({ error: error.message })
}

// Setting up middleware
app.use(cors())
app.use(express.json())
app.use(jwtCheck)

// Setting up routes
app.use('/api/user', userRoutes)
app.use('/api/project', projectRoutes)
app.use('/api/friend', friendRoutes)
app.use('/api/comment', commentRoutes)
app.use('/api/reaction', reactionRoutes)

app.use(errController)

module.exports = app
