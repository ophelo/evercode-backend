const express = require('express')
const FriendController = require('./controller/friend')
const RequestController = require('./controller/request')
const { getUser } = require('../middleware/auth')

const friendRoutes = express.Router()

friendRoutes.post('/request/send/:friendId', getUser, RequestController.request_send)

friendRoutes.get('/request', getUser, RequestController.request_list)

friendRoutes.post('/request/:requestId/:cmd', getUser, RequestController.request_action)

friendRoutes.get('/', getUser, FriendController.friend_list)

module.exports = friendRoutes
