const express = require('express')
const User = require('./model')

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /listings.
const userRoutes = express.Router()

// This section will help you get a list of all the documents.
userRoutes.route('/users').get(async function (req, res) {
  const users = await User.find({})
  res.json(users)
})

// This section will help you get a list of all the documents.
userRoutes.route('/addUser').get(async function (req, res) {
  const user = await User.create({
    name: 'prova',
    age: 12
  })
  res.json(user)
})

module.exports = userRoutes
